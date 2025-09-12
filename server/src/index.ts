import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { AppDataSource } from "./config/database";
import { VideoStatus } from "./models/Videos";
import { z } from "zod";
import { randomUUID } from "crypto";
import cors from "cors";
import { publishClipEvent } from "./rabbitmq/publisher";
import nodeMailer from "nodemailer";
import { config } from "./config/dotenv";
import cookieParser from "cookie-parser"
import pedidosRouter from './routes/pedidos'
import produtosRouter from './routes/produtos'

import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { serialize as serializeCookie, parse as parseCookie } from "cookie";

type ContactFormPayload = {
  estabelecimento: string;
  cnpjCpf: string;
  cep: string;
  endereco: string;
  estado: string;
  cidade: string;
  nome: string;
  telefone: string;
  email: string;
  segmento: string;
  qtdCameras: number | string;
  obs: string;
};

AppDataSource.initialize()
  .then(() => {
    (async () => {
      const app = express();

      const transporter = nodeMailer.createTransport({
        host: config.mail_host,
        port: 465,
        secure: true,
        auth: {
          user: config.mail_user,
          pass: config.mail_pass,
        },
      });

      app.use(cookieParser())

      app.use((req, res, next) => {
        next();
      });

      const ALLOWED_ORIGINS = new Set([
        "https://www.gravanois.com.br",
        "https://gravanois.com.br",
        "http://localhost:5173",
        "http://localhost:5174",
      ]);

      app.set('trust proxy', 1)

      app.use(
        cors({
          origin(origin, cb) {
            if (!origin) return cb(null, true);
            if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
            return cb(new Error(`CORS: origin não permitido: ${origin}`));
          },
          credentials: true,
          methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
          allowedHeaders: "*",
          exposedHeaders: ['Set-Cookie'],
        })
      );

      app.use(express.json());

      // Temporary routes (Felix3D)
      app.use('/temp_felix3d/pedidos', pedidosRouter)
      app.use('/temp_felix3d/produtos', produtosRouter)

      // Initialize Supabase client with service role key (secure, only on server)
      const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

      // Acumula cookies que o @supabase/ssr deseja setar e envia antes de finalizar a resposta
      function flushSupabaseCookies(res: Response) {
        const pending = (res.locals._sb_cookies as { name: string; value: string; options: any }[]) || [];
        if (!pending.length) return;
        pending.forEach(({ name, value, options }) => {
          res.append('Set-Cookie', serializeCookie(name, value, options));
        });
        res.locals._sb_cookies = [];
      }

      function makeSupabase(req: Request, res: Response) {
        return createServerClient(config.supabaseUrl!, config.supabasePublishableKey!, {
          cookies: {
            getAll() {
              const parsed = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
              const arr = Object.entries(parsed).map(([name, value]) => ({ name, value: String(value ?? "") }));

              if (!arr.length) {
                console.error("No cookies found in request");
              }

              return arr.length ? arr : null;
            },
            setAll(cookies) {
              const sameSiteOpt = (config.cookie_same_site?.toLowerCase?.() as any) || 'lax';
              const normalized = cookies.map(({ name, value, options }) => ({
                name,
                value,
                options: {
                  path: '/',
                  httpOnly: true,
                  secure: config.env === 'production',
                  sameSite: sameSiteOpt,
                  ...options,
                } as any,
              }));
              res.locals._sb_cookies = (
                (res.locals._sb_cookies as any[]) || []
              ).concat(normalized);
            },
          },
        });
      }

      // email login
      app.post("/sign-in", async (req, res) => {
        const { email, password } = req.body ?? {};
        if (!email || !password) return res.status(400).json({ error: "missing_credentials" });

        const supabase = makeSupabase(req, res);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ error: error.message });

        // Envia cookies antes de finalizar
        flushSupabaseCookies(res)
        return res.status(204).end();
      });

      app.post("/sign-up", async (req, res) => {
        const { email, password } = req.body ?? {};
        if (!email || !password) return res.status(400).json({ error: "missing_credentials" });

        const supabase = makeSupabase(req, res);
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return res.status(400).json({ error: error.message });

        // Se “Email confirmations” estiver ON, o usuário só loga após confirmar por e-mail
        return res.status(200).json({ status: "check_email" });
      });

      app.post("/sign-out", async (req, res) => {
        const supabase = makeSupabase(req, res);
        await supabase.auth.signOut(); // limpa os cookies
        flushSupabaseCookies(res)
        return res.status(204).end();
      });

      // TODO: Fazer busca de dados do usuario na tabela
      app.get("/auth/me", async (req, res) => {
        const supabase = makeSupabase(req, res);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) return res.status(401).json({ error: "unauthorized" });

        const { data: profile } = await supabase.from("grn_auth.profiles").select("*").eq("id", user.id).single();

        return res.json({
          user: { id: user.id, email: user.email, app_metadata: user.app_metadata },
          profile
        });
      });

      // google login
      app.get("/auth/login/google", async (req: Request, res: Response, next: NextFunction) => {
        const nextUrl = typeof req.query.next === 'string' ? req.query.next : '/'
        const supabase = makeSupabase(req, res)

        // Usa BACKEND_PUBLIC_URL, com fallback dinâmico a partir do host atual
        const dynamicBase = `${req.protocol}://${req.get('host')}`
        const base = config.backend_public_url || dynamicBase
        const url_callback = `${base}/auth/callback`
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: url_callback, // backend callback
            queryParams: { access_type: 'offline', prompt: 'consent' },
          },
        })
        if (error) return res.status(500).json({ error: error.message })

        // Guarde o pós-login em cookie curto para evitar open redirect por query
        const sameSiteOpt = (config.cookie_same_site?.toLowerCase?.() as any) || 'lax'
        res.cookie('post_auth_next', nextUrl, {
          path: '/',
          httpOnly: true,
          secure: config.env === 'production',
          sameSite: sameSiteOpt,
          maxAge: 5 * 60 * 1000,
        })

        // Envia cookies do Supabase antes do redirect
        flushSupabaseCookies(res)

        return res.redirect(302, data.url) // leva o usuário ao Google
      })

      function buildFinalRedirect(nextRaw: string | undefined | null) {
        // fallback
        let next = typeof nextRaw === 'string' ? nextRaw : '/'

        try {
          // caso absoluto (http/https)
          if (/^https?:\/\//i.test(next)) {
            const url = new URL(next)
            if (ALLOWED_ORIGINS.has(`${url.protocol}//${url.host}`)) {
              // absoluto permitido
              return url.toString()
            }
            // origem não permitida → cai para fallback
            next = '/'
          }
        } catch {
          next = '/'
        }

        // caso relativo → prefixa com FRONTEND_ORIGIN
        if (!next.startsWith('/')) next = '/'
        const base = Array.from(ALLOWED_ORIGINS)[0] || 'http://localhost:5173'
        return `${config.env === 'production' ? base : 'http://localhost:5173'}${next}`
      }

      app.get("/auth/callback", async (req: Request, res: Response) => {
        try {
          const { error, error_description } = req.query as any
          if (error) {
            return res.redirect(303, `/login?e=${encodeURIComponent(error_description || error)}`)
          }

          const code = String(req.query.code || '')
          if (!code) return res.redirect(303, '/login?e=missing_code')

          const supabase = makeSupabase(req, res)

          try {
            await supabase.auth.exchangeCodeForSession(code)

          } catch (error: any) {
            return res.redirect(303, `/login?e=exchange_failed`)
          }

          const nextCookie = (req.cookies?.post_auth_next as string) || '/'
          res.clearCookie('post_auth_next', { path: '/' })

          const finalUrl = buildFinalRedirect(nextCookie)

          // Garante envio de cookies de sessão antes do redirect
          flushSupabaseCookies(res)

          return res.redirect(303, finalUrl)
        } catch (error) {
          console.error("Callback error: ", error);
        }
      });

      app.get("/videos-clips", async (req: Request, res: Response) => {
        try {
          const { venueId } = req.query;

          const videoRepository = AppDataSource.getRepository("Video");

          const clips = await videoRepository.find({
            where: { venueId },
            order: { capturedAt: "DESC" },
          });

          const paths = clips.map((c) => c.storage_path);
          const { data: signedBatch, error: signErr } = await supabase.storage
            .from("temp")
            .createSignedUrls(paths, 600);
          1;
          if (signErr) return res.status(400).json({ error: signErr });

          const items = clips.map((c, i) => ({
            clip_id: c.clip_id,
            url: signedBatch[i]?.signedUrl,
            captured_at: c.captured_at,
            duration_sec: c.duration_sec,
            meta: c.meta,
            contract_type: c.contract_type,
          }));

          res.json({ items });
        } catch (error) {
          console.error("Erro ao buscar clipes gerados: ", error);
          res.status(500).json({
            message: "Erro ao buscar clipes gerados",
          });
          return;
        }
      });

      // Send email function (contato/prospecção)
      app.post("/send-email", async (req: Request, res: Response) => {
        const {
          estabelecimento = "",
          cnpjCpf = "",
          cep = "",
          endereco = "",
          estado = "",
          cidade = "",
          nome = "",
          telefone = "",
          email = "",
          segmento = "",
          qtdCameras = 1,
          obs = "",
        } = (req.body || {}) as Partial<ContactFormPayload>;

        // ===== Validações mínimas =====
        if (!nome.trim()) {
          return res.status(400).send("Por favor, preencha o seu nome.");
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).send("Informe um e-mail válido.");
        }

        const cameras = Number.isFinite(Number(qtdCameras)) ? Number(qtdCameras) : 1;

        // ===== Assunto dinâmico =====
        const subjectParts = ["Novo Cliente Grava Nóis", `<${email}>`];
        if (estabelecimento) subjectParts.push(`— ${estabelecimento}`);
        const loc = [cidade, estado].filter(Boolean).join(" / ");
        if (loc) subjectParts.push(`(${loc})`);
        const subject = subjectParts.join(" ");

        // ===== HTML do e-mail =====
        const safe = (v?: string | number) => String(v ?? "").trim() || "—";
        const html = `
        <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:640px; margin:0 auto; background:#f9f9f9; padding:20px; border-radius:12px;">
          <div style="text-align:center; margin-bottom:20px;">
            <h1 style="color:#0d9757; font-size:22px; margin:0;">Nova Solicitação de Contato</h1>
            <p style="color:#777; margin:6px 0 0;">Grava Nóis — Formulário de Prospecção</p>
          </div>

          <div style="background:#fff; padding:18px; border-radius:10px; border:1px solid #eee;">
            <h2 style="color:#0056b3; font-size:18px; margin:0 0 12px;">Dados do Estabelecimento</h2>
            <table cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="width:40%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Estabelecimento</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          estabelecimento
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">CNPJ/CPF</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          cnpjCpf
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Segmento</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          segmento
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Qtd. Câmeras</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          cameras
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Endereço</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          endereco
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Cidade/UF</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          loc
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">CEP</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          cep
        )}</td></tr>
              </tbody>
            </table>

            <h2 style="color:#0056b3; font-size:18px; margin:20px 0 12px;">Contato</h2>
            <table cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="width:40%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Nome</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          nome
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Telefone</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          telefone
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">E-mail</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          email
        )}</td></tr>
              </tbody>
            </table>

            <h2 style="color:#0d9757; font-size:18px; margin:20px 0 8px;">Observações</h2>
            <div style="font-size:15px; color:#555; background:#f7f7f7; padding:12px; border-radius:8px; border:1px solid #eee;">
              ${safe(obs)}
            </div>
          </div>

          <div style="text-align:center; margin-top:22px; color:#888; font-size:13px;">
            <p>Este e-mail foi gerado automaticamente a partir do site.</p>
          </div>
        </div>
        `;

        try {
          await transporter.sendMail({
            to: "hendriusfelix.dev@gmail.com",
            subject,
            html,
            text: `
              Novo Cliente Grava Nóis
              Estabelecimento: ${safe(estabelecimento)}
              CNPJ/CPF: ${safe(cnpjCpf)}
              Segmento: ${safe(segmento)}
              Qtd. Câmeras: ${safe(cameras)}
              Endereço: ${safe(endereco)}
              Cidade/UF: ${safe(loc)}
              CEP: ${safe(cep)}

              Contato:
              - Nome: ${safe(nome)}
              - Telefone: ${safe(telefone)}
              - Email: ${safe(email)}

              Observações:
              ${safe(obs)}
              `.trim(),
          });

          console.log("Email sent");
          res.status(200).send("Email enviado. Entraremos em contato em breve.");
          return;
        } catch (error) {
          console.error("Erro ao enviar e-mail:", error);
          res
            .status(502)
            .send("Erro de comunicação ao enviar e-mail. Tente contato por WhatsApp -> +55 (75) 98246-6403");
          return;
        }
      });

      // Report errors (bug reports)
      app.post("/send-report", async (req: Request, res: Response) => {
        const {
          name = "",
          email = "",
          page = "",
          title = "",
          description = "",
          steps = "",
          severity = "Média",
          userAgent = "",
          url = "",
        } = (req.body || {}) as {
          name?: string;
          email?: string;
          page?: string;
          title?: string;
          description?: string;
          steps?: string;
          severity?: "Baixa" | "Média" | "Alta" | string;
          userAgent?: string;
          url?: string;
        };

        const safe = (v?: string) => String(v ?? "").trim() || "—";

        if (!description.trim()) {
          return res.status(400).send("Descrição é obrigatória.");
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).send("Informe um e-mail válido.");
        }

        const subject = ["Bug Report — Grava Nóis", title || page || "", severity ? `[${severity}]` : ""]
          .filter(Boolean)
          .join(" ");

        const html = `
        <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:720px; margin:0 auto; background:#f9f9f9; padding:20px; border-radius:12px;">
          <div style="text-align:center; margin-bottom:20px;">
            <h1 style="color:#C62828; font-size:22px; margin:0;">Relatório de Erro</h1>
            <p style="color:#777; margin:6px 0 0;">Grava Nóis — Canal interno</p>
          </div>

          <div style="background:#fff; padding:18px; border-radius:10px; border:1px solid #eee;">
            <h2 style="color:#0056b3; font-size:18px; margin:0 0 12px;">Resumo</h2>
            <table cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="width:35%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Título</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          title
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Severidade</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          String(severity)
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Página</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          page
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">URL</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          url
        )}</td></tr>
              </tbody>
            </table>

            <h2 style="color:#0d9757; font-size:18px; margin:20px 0 8px;">Descrição</h2>
            <div style="font-size:15px; color:#555; background:#f7f7f7; padding:12px; border-radius:8px; border:1px solid #eee; white-space:pre-wrap;">
              ${safe(description)}
            </div>

            ${steps?.trim()
            ? `<h3 style="color:#333; font-size:16px; margin:16px 0 8px;">Passos para reproduzir</h3>
                 <div style=\"font-size:15px; color:#555; background:#f7f7f7; padding:12px; border-radius:8px; border:1px solid #eee; white-space:pre-wrap;\">${safe(
              steps
            )}</div>`
            : ""
          }

            <h2 style="color:#0056b3; font-size:18px; margin:20px 0 12px;">Contato</h2>
            <table cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="width:35%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Nome</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
            name
          )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">E-mail</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
            email
          )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">User-Agent</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
            userAgent
          )}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="text-align:center; margin-top:22px; color:#888; font-size:13px;">
            <p>Este e-mail foi gerado automaticamente a partir do Reportar Erro.</p>
          </div>
        </div>`;

        try {
          await transporter.sendMail({
            to: "hendriusfelix.dev@gmail.com",
            subject,
            html,
            text: `
              Bug Report — Grava Nóis ${severity ? `[${severity}]` : ""}
              Título: ${safe(title)}
              Página: ${safe(page)}
              URL: ${safe(url)}

              Descrição:
              ${safe(description)}

              Passos para reproduzir:
              ${safe(steps)}

              Contato:
              - Nome: ${safe(name)}
              - Email: ${safe(email)}
              - User-Agent: ${safe(userAgent)}
            `.trim(),
          });

          return res.status(200).send("Relatório enviado. Obrigado por ajudar!");
        } catch (error) {
          console.error("Erro ao enviar e-mail de relatório:", error);
          return res.status(502).send("Falha ao enviar relatório. Tente novamente mais tarde.");
        }
      });

      // General feedback (não técnico)
      app.post("/send-feedback", async (req: Request, res: Response) => {
        const {
          name = "",
          email = "",
          message = "",
          page = "",
          url = "",
        } = (req.body || {}) as {
          name?: string;
          email?: string;
          message?: string;
          page?: string;
          url?: string;
        };

        const safe = (v?: string) => String(v ?? "").trim() || "—";
        if (!message.trim()) return res.status(400).send("Mensagem é obrigatória.");
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          return res.status(400).send("Informe um e-mail válido.");

        const subject = ["Feedback — Grava Nóis", page || "", email ? `<${email}>` : ""].filter(Boolean).join(" ");

        const html = `
        <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6; max-width:720px; margin:0 auto; background:#f9f9f9; padding:20px; border-radius:12px;">
          <div style="text-align:center; margin-bottom:20px;">
            <h1 style="color:#0d9757; font-size:22px; margin:0;">Novo Feedback</h1>
            <p style="color:#777; margin:6px 0 0;">Grava Nóis — Site/App</p>
          </div>

          <div style="background:#fff; padding:18px; border-radius:10px; border:1px solid #eee;">
            <h2 style="color:#0056b3; font-size:18px; margin:0 0 12px;">Mensagem</h2>
            <div style="font-size:15px; color:#555; background:#f7f7f7; padding:12px; border-radius:8px; border:1px solid #eee; white-space:pre-wrap;">
              ${safe(message)}
            </div>

            <h2 style="color:#0056b3; font-size:18px; margin:20px 0 12px;">Detalhes</h2>
            <table cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="width:35%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Nome</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          name
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">E-mail</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          email
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Página</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          page
        )}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">URL</td><td style="border-bottom:1px solid #f0f0f0;">${safe(
          url
        )}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="text-align:center; margin-top:22px; color:#888; font-size:13px;">
            <p>Este e-mail foi gerado automaticamente a partir do site.</p>
          </div>
        </div>`;

        try {
          await transporter.sendMail({
            to: "hendriusfelix.dev@gmail.com",
            subject,
            html,
            text: `
              Feedback — Grava Nóis
              Página: ${safe(page)}
              URL: ${safe(url)}

              Mensagem:
              ${safe(message)}

              Contato:
              - Nome: ${safe(name)}
              - Email: ${safe(email)}
            `.trim(),
          });
          return res.status(200).send("Feedback enviado. Obrigado!");
        } catch (error) {
          console.error("Erro ao enviar e-mail de feedback:", error);
          return res.status(502).send("Falha ao enviar feedback. Tente novamente mais tarde.");
        }
      });

      // Health check
      app.get("/", (req: Request, res: Response) => {
        res.send("Video upload api is running.");
      });

      // Listagem de videos para o frontEnd
      /** ========================= API DOC =========================
       * GET /api/videos/list
       *
       * Lista arquivos (não recursivo) em um prefix do Supabase Storage
       * e retorna URLs assinadas para preview e download.
       *
       * Query params:
       * - bucket: string (default: "temp")
       *     Buckets permitidos (validados por allowlist no backend).
       * - prefix: string (default: "")
       *     Caminho dentro do bucket. Ex.: "temp/test/test2".
       *     É sanitizado (remove //, trim de /, bloqueia "..").
       * - limit: number (default: 100, range: 1..100)
       * - offset: number (default: 0, >= 0)
       * - order: "asc" | "desc" (default: "desc")
       * - ttl: number (default: 3600, range: 60..86400)
       *     Tempo de expiração (segundos) das URLs assinadas.
       *
       * Respostas:
       * 200 OK
       *   {
       *     bucket: string,
       *     prefix: string,
       *     count: number,
       *     files: Array<{
       *       name: string,
       *       path: string,           // prefix/name
       *       bucket: string,
       *       size: number | null,    // metadata.size
       *       last_modified: string | null, // updated_at || created_at
       *       preview_url: string | null,   // signed GET
       *       download_url: string | null   // signed GET (download=1)
       *     }>
       *   }
       *
       * 400 Bad Request
       *   { error: "Invalid bucket" | "Invalid prefix" }
       *
       * 502 Bad Gateway
       *   { error: string, details?: string }  // falha ao listar ou assinar URLs
       *
       * 500 Internal Server Error
       *   { error: "Internal server error" }
       *
       * Segurança / Observações:
       * - Allowlist de buckets (evita enumeração indevida).
       * - `prefix` sanitizado (bloqueia path traversal com "..").
       * - A listagem é **não recursiva** (apenas o nível de `prefix`).
       * - Pastas são filtradas; retornamos apenas itens com `metadata.size`.
       *
       * Exemplos:
       * - GET /api/videos/list?bucket=temp&prefix=temp/test/test2&limit=50&order=desc
       * - GET /api/videos/list?prefix=main/cliente123/jogo-45&ttl=1800
       * - GET /api/videos/list?bucket=temp&prefix=temp/test/test2&limit=10&order=desc&ttl=3600"
       * =========================================================== */
      const ALLOWED_BUCKETS = new Set(["temp", "main"]);

      function sanitizePrefix(raw: string): string {
        const decoded = decodeURIComponent(raw || "");
        if (decoded.includes("..")) throw new Error("invalid_prefix");
        const compact = decoded.replace(/\/{2,}/g, "/");
        return compact.replace(/^\/+|\/+$/g, ""); // remove barras no começo/fim
      }

      function clamp(n: number, min: number, max: number) {
        return Math.min(max, Math.max(min, n));
      }
      app.get("/api/videos/list", async (req: Request, res: Response) => {
        try {
          // ========= Query params =========
          const bucket = typeof req.query.bucket === "string" ? req.query.bucket : "temp";
          if (!ALLOWED_BUCKETS.has(bucket)) {
            return res.status(400).json({ error: "Invalid bucket" });
          }

          const prefixRaw = typeof req.query.prefix === "string" ? req.query.prefix : "";
          let prefix = "";
          try {
            prefix = sanitizePrefix(prefixRaw);
          } catch {
            return res.status(400).json({ error: "Invalid prefix" });
          }

          const limit = clamp(
            Number.isFinite(+req.query.limit!) ? parseInt(req.query.limit as string, 10) : 100,
            1,
            100
          );

          const offset = Math.max(
            0,
            Number.isFinite(+req.query.offset!) ? parseInt(req.query.offset as string, 10) : 0
          );
          const order: "asc" | "desc" = req.query.order === "asc" ? "asc" : "desc";

          // IMPORTANTE: aplicar limit, offset e order na listagem
          // Ordenar por data de atualização para que os mais recentes venham primeiro
          const { data: items, error: listErr } = await supabase.storage
            .from(bucket)
            .list(prefix, { limit, offset, sortBy: { column: "updated_at", order } });

          if (listErr) return res.status(502).json({ error: "Failed to list files", details: listErr.message });

          const files = (items ?? []).filter((it: any) => it?.metadata && typeof it.metadata.size === "number");
          const result = files.map((f: any) => ({
            name: f.name,
            path: prefix ? `${prefix}/${f.name}` : f.name,
            bucket,
            size: f.metadata?.size ?? null,
            last_modified: f.updated_at ?? f.created_at ?? null,
          }));

          // paginação simples pelo tamanho retornado
          const hasMore = files.length === limit;
          const nextOffset = offset + files.length;

          // cache curtinho da lista (não das URLs assinadas)
          res.setHeader("Cache-Control", "private, max-age=15");
          return res.json({ bucket, prefix, count: result.length, files: result, hasMore, nextOffset });
        } catch (err: any) {
          console.error("Error listing videos:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
      });

      // Assinar sob demanda (preview ou download)
      app.get("/api/videos/sign", async (req: Request, res: Response) => {
        try {
          const bucket = typeof req.query.bucket === "string" ? req.query.bucket : "temp";
          const path = typeof req.query.path === "string" ? req.query.path : "";
          const kind = req.query.kind === "download" ? "download" : "preview";
          const ttlSec = clamp(Number.parseInt(String(req.query.ttl ?? "3600"), 10) || 3600, 60, 86400);

          if (!ALLOWED_BUCKETS.has(bucket)) return res.status(400).json({ error: "Invalid bucket" });
          if (!path || path.includes("..")) return res.status(400).json({ error: "Invalid path" });

          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, ttlSec, { download: kind === "download" });

          if (error) return res.status(502).json({ error: "Failed to sign URL", details: error.message });

          // TTL menor no cache do JSON para evitar re-play storm
          res.setHeader("Cache-Control", "private, max-age=5");
          return res.json({ url: data?.signedUrl ?? null });
        } catch (e) {
          return res.status(500).json({ error: "Internal server error" });
        }
      });

      /**
       * Recebe metadados do vídeo
       * @param clientId - ID do cliente
       * @param venueId - ID do local // Evita pegar a instalação errada se o cliente tiver várias
       * @description Este endpoint recebe metadados do vídeo e inicia o processo de upload.
       * 1. Descobre contrato (`monthly` | `per_video`).
       * 2. Define destino (path):
       *    - `monthly` → `main/clients/{client_id}/venues/{venue_id}/YYYY/MM/DD/{clip_id}.mp4`
       *    - `per_video` → `temp/{client_id}/{venue_id}/{clip_id}.mp4`
       * 3. Cria registro `clips` (status=`queued`).
       *    - Gera **URL assinada** para upload.
       * 4. Não publica no RabbitMQ ainda.
       *
       * @body {
       *   "venue_id": string,
       *   "duration_sec": number,
       *   "captured_at": timestamp,
       *   "meta": object, // { "codec": "h264", "fps": 30, "width": 1920, "height": 1080 },
       *   "sha256": string, // hash do arquivo de vídeo "HEX_DO_ARQUIVO"
       * }
       *
       * @returns JSON com mensagem de sucesso e informações de upload,
       * {
       *  "clip_id": "nanoid-clip-id", //* Id único
       *  "contract_type": "per_video",
       *  "storage_path": "temp/uuid-client/uuid-venue/nanoid-clip-id.mp4",
       *  "upload_url": "https://...signed-url...", //* O upload real do vídeo é realizado pela url retornada
       *  "expires_hint_hours": 12
       * }
       */
      app.post("/api/videos/metadados/client/:clientId/venue/:venueId", async (req: Request, res: Response) => {
        try {
          const { clientId, venueId } = req.params;

          const bodySchema = z.object({
            venue_id: z.string().uuid(),
            captured_at: z.string(),

            sha256: z.string().regex(/^[a-f0-9]{64}$/i),
          });

          // Validate Body
          const parsed = bodySchema.safeParse(req.body);
          if (!parsed.success) {
            res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
            return;
          }
          const { captured_at, sha256 } = parsed.data;
          // const { duration_sec, captured_at, meta, sha256 } = parsed.data;

          // Validate Client ID
          const clientRepository = AppDataSource.getRepository("Client");
          const client = await clientRepository.findOne({ where: { id: clientId } });

          if (!client) {
            res.status(404).json({ error: "Client not found." });
            return;
          }

          // 1. Descobre contrato
          let contractType: string; // Lógica para determinar o tipo de contrato

          const venueInstalationRepo = AppDataSource.getRepository("VenueInstallation");
          const venue = await venueInstalationRepo.findOne({
            where: { clientId: clientId, id: venueId },
            select: ["contractMethod"],
          });

          if (!venue?.contractMethod) {
            // TODO: Adicionar lógica de erro e envio de mensagem para central do cliente
            res.status(404).json({ error: "Venue installation not found or contract method not defined." });
            return;
          }
          contractType = venue.contractMethod; // "monthly_subscription" | "per_video"

          // Define destino
          let storagePath: string;
          const clip_id = randomUUID();
          if (contractType === "monthly_subscription") {
            const clipDate = new Date(captured_at);

            const month = clipDate.getMonth() + 1;
            const day = clipDate.getDate();
            storagePath = `main/clients/${clientId}/venues/${venueId}/${month}/${day}/${clip_id}.mp4`;
          } else {
            storagePath = `temp/${clientId}/${venueId}/${clip_id}.mp4`;
          }

          const capturedAtDate = new Date(captured_at);

          // 3. Cria registro `clips`
          const clip = {
            clipId: clip_id,
            clientId: clientId,
            venueId: venueId,
            capturedAt: capturedAtDate,
            contract: contractType,
            sha256,
            status: "queued",
            storagePath,
          };

          const videoRepository = AppDataSource.getRepository("Video");

          const existingClip = await videoRepository.findOne({ where: { clipId: clip.clipId } });
          if (existingClip) {
            res.status(409).json({ error: "Clip with this ID already exists." });
            return;
          }

          const videoClip = videoRepository.create(clip);
          await videoRepository.save(videoClip);

          // Gera URL assinada para upload
          const { data, error } = await supabase.storage
            .from("temp") // Bucket temporário do supabase
            .createSignedUploadUrl(storagePath);

          if (error || !data?.signedUrl) {
            console.error("createSignedUploadUrl error:", error);
            return res.status(500).json({ error: "Failed to create signed upload URL" });
          }

          res.status(201).json({
            clip_id: clip.clipId,
            contract_type: contractType,
            storage_path: storagePath,
            upload_url: data.signedUrl,
            expires_hint_hours: 12,
          });
        } catch (error) {
          console.error("Error processing video metadata:", error);
          res.status(500).json({ error: "Internal server error." });
          return;
        }
      });

      /**
       * Recebe metadados do vídeo
       * @param clientId - ID do cliente
       * @description Este endpoint recebe metadados do vídeo e inicia o processo de upload.
       * - Valida existência do objeto no `storage_path` e integridade (sha256/size).
       * - Atualiza `clips.status` → `uploaded_temp` (contrato por vídeo) **ou** `uploaded` (contrato mensalidade).
       * - **Publica** mensagem no RabbitMQ (`clip.created`) com metadados necessários para o worker (idempotente).
       *
       * @body {
       *   "size_bytes": number, // Tamanho do arquivo em bytes ex: 18234000
       *   "sha256": string // "HEX_DO_ARQUIVO"
       * }
       *
       * Publica para o RabbitMQ:
       * {
       *  "event": "clip.created",
       *  "clip_id": "nanoid-clip-id",
       *  "client_id": "uuid-client",
       *  "venue_id": "uuid-venue",
       *  "contract_type": "monthly | per_video",
       *  "storage_path": "temp/.../clip.mp4 or main/.../clip.mp4",
       *  "duration_sec": 14,
       *  "captured_at": "2025-08-14T12:34:56Z",
       *  "sha256": "HEX",
       *  "size_bytes": 18234000,
       *  "meta": { "codec": "h264", "fps": 30, "width": 1920, "height": 1080 }
       * }
       *
       * @returns JSON com mensagem de sucesso e informações de upload
       * {
       *  "clip_id": "nanoid-clip-id",
       *  "contract_type": "per_video",
       *  "storage_path": "temp/uuid-client/uuid-venue/nanoid-clip-id.mp4",
       *  "upload_url": "https://...signed-url...",
       *  "expires_hint_hours": 12
       * }
       */
      app.post("/api/videos/:videoId/uploaded", async (req: Request, res: Response) => {
        try {
          const { videoId } = req.params;

          // 1) Validate body
          const bodySchema = z.object({
            size_bytes: z.number().int().nonnegative(),
            sha256: z.string().regex(/^[a-f0-9]{64}$/i),
            etag: z.string().min(1).optional(), // opcional
          });
          const parsed = bodySchema.safeParse(req.body);
          if (!parsed.success) {
            res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
            return;
          }
          const { size_bytes, sha256, etag: clientEtag } = parsed.data;

          // 2) Fetch video by clipId
          const videoRepository = AppDataSource.getRepository("Video");
          const video = await videoRepository.findOne({ where: { clipId: videoId } });
          if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
          }

          if (!video.storagePath) {
            res.status(422).json({ error: "Video has no storage_path set" });
            return;
          }

          // 3) Verifica existência e tamanho via HEAD (evita baixar o blob inteiro)
          const storagePath = video.storagePath as string;
          const bucket = storagePath.startsWith("main/") ? "main" : "temp";

          const { data: signedGet, error: signErr } = await supabase.storage
            .from(bucket)
            .createSignedUrl(storagePath, 60);
          if (signErr || !signedGet?.signedUrl) {
            res.status(502).json({ error: "Failed to create signed GET URL to verify upload" });
            return;
          }

          const headResp = await fetch(signedGet.signedUrl, { method: "HEAD" });
          if (!headResp.ok) {
            res.status(422).json({ error: "Uploaded object not accessible for verification (HEAD failed)" });
            return;
          }

          const contentLength = Number(headResp.headers.get("content-length") || "0");
          const objectEtagRaw = headResp.headers.get("etag") || headResp.headers.get("x-etag") || undefined;
          const objectEtag = objectEtagRaw ? objectEtagRaw.replace(/\"/g, "") : undefined;

          if (contentLength !== size_bytes) {
            res.status(422).json({
              error: "Uploaded object size mismatch",
              details: { expected: { size_bytes }, got: { size_bytes: contentLength } },
            });
            return;
          }

          if (clientEtag && objectEtag && clientEtag.replace(/\"/g, "") !== objectEtag) {
            res.status(422).json({ error: "ETag mismatch", details: { expected: clientEtag, got: objectEtag } });
            return;
          }

          // 4) Update status based on contract type and persist size/sha
          const newStatus =
            video.contract === "monthly_subscription" ? VideoStatus.UPLOADED : VideoStatus.UPLOADED_TEMP;

          video.status = newStatus;
          video.sha256 = sha256;
          video.sizeBytes = String(size_bytes);
          await videoRepository.save(video);

          // 5) Publica evento no RabbitMQ (clip.created)
          // try {
          //   await publishClipEvent("clip.created", {
          //     event: "clip.created",
          //     clip_id: video.clipId,
          //     client_id: video.clientId,
          //     venue_id: video.venueId,
          //     contract_type: video.contract,
          //     storage_path: video.storagePath,
          //     duration_sec: video.durationSec,
          //     captured_at: video.capturedAt?.toISOString?.() ?? new Date().toISOString(),
          //     sha256,
          //     size_bytes,
          //     meta: video.meta ?? {},
          //   });
          // } catch (e) {
          //   console.warn("[rabbitmq] Failed to publish clip.created:", e);
          // }

          // 6) Return JSON
          res.json({
            clip_id: video.clipId,
            contract_type: video.contract,
            storage_path: video.storagePath,
            status: newStatus === VideoStatus.UPLOADED ? "uploaded" : "uploaded_temp",
          });
        } catch (err) {
          console.error("Error finalizing uploaded video:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      });

      // Realiza criação de novo client
      app.post("/api/clients/", async (req: Request, res: Response) => {
        try {
          const data = req.body;

          if (!data || !data.legalName || !data.email || (!data.cnpj && !data.responsibleCpf)) {
            return res.status(400).json({ error: "Nome/Razão Social, Email e cpf/cnpj são obrigatórios." });
          }

          //! TODO: Fazer verificação da existencia de client

          const clientRepository = AppDataSource.getRepository("Client");
          const newClient = clientRepository.create({
            legalName: data.legalName,
            email: data.email,
            cnpj: data.cnpj,
            responsibleCpf: data.responsibleCpf,
          });
          await clientRepository.save(newClient);

          res.status(201).json(newClient);
        } catch (error) {
          console.error("Error creating client:", error);
          res.status(500).json({ error: "Internal server error." });
        }
      });

      // Cadastro de local e filizal instalada o serviço
      app.post("/api/venue-installations/:clientId", async (req: Request, res: Response) => {
        try {
          const data = req.body;
          const { clientId } = req.params;

          if (
            !data ||
            !clientId ||
            !data.venueName ||
            !data.addressLine ||
            !data.country ||
            !data.state ||
            !data.city ||
            !data.postalCode
          ) {
            return res.status(400).json({
              error: "Client ID, Venue Name, Address Line, Country, State, City and Postal Code are required.",
            });
          }

          const venueInstallationRepository = AppDataSource.getRepository("VenueInstallation");
          const newVenueInstallation = venueInstallationRepository.create({
            clientId: clientId,
            venueName: data.venueName,
            addressLine: data.addressLine,
            country: data.country,
            state: data.state,
            city: data.city,
            postalCode: data.postalCode,
          });
          await venueInstallationRepository.save(newVenueInstallation);

          res.status(201).json(newVenueInstallation);
        } catch (error) {
          console.error("Error creating venue installation:", error);
          res.status(500).json({ error: "Internal server error." });
        }
      });

      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
      });
    })();
  })
  .catch((error) => {
    console.error("Error initializing Data Source:", error);
  });
