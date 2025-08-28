import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { AppDataSource } from './config/database';
import { VideoStatus } from './models/Videos';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import cors from "cors"
import { publishClipEvent } from './rabbitmq/publisher';
import nodeMailer from "nodemailer"
import { config } from './config/dotenv';

import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr"
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

      app.use(cors({
        origin: ["http://localhost:5174", "https://www.gravanois.com.br"],
        credentials: true,
      }));
    
      app.use(express.json())

      // Initialize Supabase client with service role key (secure, only on server)
      const supabase = createClient(
        config.supabaseUrl,
        config.supabaseServiceKey
      );

      function makeSupabase(req: Request, res: Response) {
        return createServerClient(
          config.supabaseUrl!,
          config.supabasePublishableKey!,
          {
            cookies: {
              getAll() {
                const parsed = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
                const arr = Object.entries(parsed).map(([name, value]) => ({ name, value: String(value ?? "") }));
                return arr.length ? arr : null;
              },
              setAll(cookies) {
                cookies.forEach(({ name, value, options }) => {
                  const final = {
                    path: "/",
                    sameSite: "lax" as const,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    ...options,
                  };
                  res.append("Set-Cookie", serializeCookie(name, value, final));
                });
              },
            },
          }
        );
      };

      // email login
      app.post("/sign-in", async (req, res) => {
        const { email, password } = req.body ?? {};
        if (!email || !password) return res.status(400).json({ error: "missing_credentials" });

        const supabase = makeSupabase(req, res);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ error: error.message });

        // Cookies HttpOnly já foram setados pelo @supabase/ssr via setAll()
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
        return res.status(204).end();
      });

      app.get("/me", async (req, res) => {
        const supabase = makeSupabase(req, res);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return res.status(401).json({ error: "unauthorized" });

        // Ex.: buscar perfil
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        return res.json({ user: { id: user.id, email: user.email, app_metadata: user.app_metadata }, profile });
      });


      // google login
      app.get("/auth/callback", async (req: Request, res: Response) => {
        const code = req.query.code;
        const nextRaw = req.query.next ?? "/";

        if (code) {
          const supabase = createServerClient(config.supabaseUrl, config.supabasePublishableKey,
            {
              cookies: {
                getAll() {
                  const parsed = req.headers.cookie
                    ? parseCookie(req.headers.cookie)
                    : {};
                  const entries = Object.entries(parsed).map(([name, value]) => ({
                    name,
                    value: String(value ?? ""), // ensure non-optional string
                  }));
                  return entries.length ? entries : null;
                },
                setAll(cookies) {
                  cookies.forEach(({ name, value, options }) => {
                    // You can tweak defaults if you want:
                    // const final = { path: "/", sameSite: "lax", ...options };
                    const final = options ?? { path: "/" };
                    res.append(
                      "Set-Cookie",
                      serializeCookie(name, value, final)
                    );
                  });
                },
              },
            });

          await supabase.auth.exchangeCodeForSession(code as string)
        }

        // Prevent open-redirects & normalize path
        let safeNext = nextRaw as string;
        // reject absolute URLs and protocol-relative URLs
        if (/^https?:\/\//i.test(safeNext) || /^\/\//.test(safeNext)) {
          safeNext = "/";
        }
        // ensure single leading slash, strip query/fragment if you want only paths
        safeNext = "/" + safeNext.replace(/^\/+/, "");
        // optional: keep querystring if you expect it; otherwise strip:
        // safeNext = safeNext.split("?")[0].split("#")[0];

        return res.redirect(303, safeNext);
      });

      app.get("/videos-clips", async (req: Request, res: Response) => {
        try {
          const { venueId } = req.query;

          const videoRepository = AppDataSource.getRepository('Video');

          const clips = await videoRepository.find({
            where: { venueId },
            order: { capturedAt: 'DESC' },
          });

          const paths = clips.map(c => c.storage_path);
          const { data: signedBatch, error: signErr } = await supabase
            .storage
            .from('temp')
            .createSignedUrls(paths, 600);

          if (signErr) return res.status(400).json({ error: signErr });

          const items = clips.map((c, i) => ({
            clip_id: c.clip_id,
            url: signedBatch[i]?.signedUrl,
            captured_at: c.captured_at,
            duration_sec: c.duration_sec,
            meta: c.meta,
            contract_type: c.contract_type
          }));

          res.json({ items });
        } catch (error) {
          console.error("Erro ao buscar clipes gerados: ", error);
          res.status(500).json({
            message: "Erro ao buscar clipes gerados"
          })
          return;
        }
      })

      // Send email function
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
        const safe = (v?: string | number) => (String(v ?? "").trim() || "—");
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
                <tr><td style="width:40%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Estabelecimento</td><td style="border-bottom:1px solid #f0f0f0;">${safe(estabelecimento)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">CNPJ/CPF</td><td style="border-bottom:1px solid #f0f0f0;">${safe(cnpjCpf)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Segmento</td><td style="border-bottom:1px solid #f0f0f0;">${safe(segmento)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Qtd. Câmeras</td><td style="border-bottom:1px solid #f0f0f0;">${safe(cameras)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Endereço</td><td style="border-bottom:1px solid #f0f0f0;">${safe(endereco)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Cidade/UF</td><td style="border-bottom:1px solid #f0f0f0;">${safe(loc)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">CEP</td><td style="border-bottom:1px solid #f0f0f0;">${safe(cep)}</td></tr>
              </tbody>
            </table>

            <h2 style="color:#0056b3; font-size:18px; margin:20px 0 12px;">Contato</h2>
            <table cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="width:40%; font-weight:bold; border-bottom:1px solid #f0f0f0;">Nome</td><td style="border-bottom:1px solid #f0f0f0;">${safe(nome)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">Telefone</td><td style="border-bottom:1px solid #f0f0f0;">${safe(telefone)}</td></tr>
                <tr><td style="font-weight:bold; border-bottom:1px solid #f0f0f0;">E-mail</td><td style="border-bottom:1px solid #f0f0f0;">${safe(email)}</td></tr>
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
          return
        } catch (error) {
          console.error("Erro ao enviar e-mail:", error);
          res
            .status(502)
            .send(
              "Erro de comunicação ao enviar e-mail. Tente contato por WhatsApp -> +55 (75) 98246-6403"
            );
          return
        }
      });

      // Health check
      app.get("/", (req: Request, res: Response) => {
        res.send("Video upload api is running.");
      })

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
            duration_sec: z.number().int().positive(),
            captured_at: z.string(),
            meta: z.object({
              codec: z.string(),
              fps: z.number().int().positive(),
              width: z.number().int().positive(),
              height: z.number().int().positive()
            }),
            sha256: z.string().regex(/^[a-f0-9]{64}$/i)
          });

          // Validate Body
          const parsed = bodySchema.safeParse(req.body);
          if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
            return;
          }
          const { duration_sec, captured_at, meta, sha256 } = parsed.data;

          // Validate Client ID
          const clientRepository = AppDataSource.getRepository("Client");
          const client = await clientRepository.findOne({ where: { id: clientId } });

          if (!client) {
            res.status(404).json({ error: "Client not found." });
            return;
          }

          // 1. Descobre contrato
          let contractType: string; // Lógica para determinar o tipo de contrato

          const venueInstalationRepo = AppDataSource.getRepository("VenueInstallation")
          const venue = await venueInstalationRepo.findOne({
            where: { clientId: clientId, id: venueId },
            select: ["contractMethod"]
          })

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
            durationSec: duration_sec,
            capturedAt: capturedAtDate,
            contract: contractType,
            meta,
            sha256,
            status: "queued",
            storagePath
          };

          const videoRepository = AppDataSource.getRepository("Video");

          const existingClip = await videoRepository.findOne({ where: { clipId: clip.clipId } });
          if (existingClip) {
            res.status(409).json({ error: "Clip with this ID already exists." });
            return
          }

          const videoClip = videoRepository.create(clip);
          await videoRepository.save(videoClip);

          // Gera URL assinada para upload
          const { data, error } = await supabase
            .storage
            .from("temp") // Bucket temporário do supabase
            .createSignedUploadUrl(storagePath);

          if (error || !data?.signedUrl) {
            console.error('createSignedUploadUrl error:', error);
            return res.status(500).json({ error: 'Failed to create signed upload URL' });
          }

          res.status(201).json({
            clip_id: clip.clipId,
            contract_type: contractType,
            storage_path: storagePath,
            upload_url: data.signedUrl,
            expires_hint_hours: 12
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
      app.post('/api/videos/:videoId/uploaded', async (req: Request, res: Response) => {
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
            res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
            return;
          }
          const { size_bytes, sha256, etag: clientEtag } = parsed.data;

          // 2) Fetch video by clipId
          const videoRepository = AppDataSource.getRepository('Video');
          const video = await videoRepository.findOne({ where: { clipId: videoId } });
          if (!video) {
            res.status(404).json({ error: 'Video not found' });
            return;
          }

          if (!video.storagePath) {
            res.status(422).json({ error: 'Video has no storage_path set' });
            return;
          }

          // 3) Verifica existência e tamanho via HEAD (evita baixar o blob inteiro)
          const storagePath = video.storagePath as string;
          const bucket = storagePath.startsWith('main/') ? 'main' : 'temp';

          const { data: signedGet, error: signErr } = await supabase
            .storage
            .from(bucket)
            .createSignedUrl(storagePath, 60);
          if (signErr || !signedGet?.signedUrl) {
            res.status(502).json({ error: 'Failed to create signed GET URL to verify upload' });
            return;
          }

          const headResp = await fetch(signedGet.signedUrl, { method: 'HEAD' });
          if (!headResp.ok) {
            res.status(422).json({ error: 'Uploaded object not accessible for verification (HEAD failed)' });
            return;
          }

          const contentLength = Number(headResp.headers.get('content-length') || '0');
          const objectEtagRaw = headResp.headers.get('etag') || headResp.headers.get('x-etag') || undefined;
          const objectEtag = objectEtagRaw ? objectEtagRaw.replace(/\"/g, '') : undefined;

          if (contentLength !== size_bytes) {
            res.status(422).json({
              error: 'Uploaded object size mismatch',
              details: { expected: { size_bytes }, got: { size_bytes: contentLength } },
            });
            return;
          }

          if (clientEtag && objectEtag && clientEtag.replace(/\"/g, '') !== objectEtag) {
            res.status(422).json({ error: 'ETag mismatch', details: { expected: clientEtag, got: objectEtag } });
            return;
          }

          // 4) Update status based on contract type and persist size/sha
          const newStatus = video.contract === 'monthly_subscription'
            ? VideoStatus.UPLOADED
            : VideoStatus.UPLOADED_TEMP;

          video.status = newStatus;
          video.sha256 = sha256;
          video.sizeBytes = String(size_bytes);
          await videoRepository.save(video);

          // 5) Publica evento no RabbitMQ (clip.created)
          try {
            await publishClipEvent('clip.created', {
              event: 'clip.created',
              clip_id: video.clipId,
              client_id: video.clientId,
              venue_id: video.venueId,
              contract_type: video.contract,
              storage_path: video.storagePath,
              duration_sec: video.durationSec,
              captured_at: video.capturedAt?.toISOString?.() ?? new Date().toISOString(),
              sha256,
              size_bytes,
              meta: video.meta ?? {},
            });
          } catch (e) {
            console.warn('[rabbitmq] Failed to publish clip.created:', e);
          }

          // 6) Return JSON
          res.json({
            clip_id: video.clipId,
            contract_type: video.contract,
            storage_path: video.storagePath,
            status: newStatus === VideoStatus.UPLOADED ? 'uploaded' : 'uploaded_temp',
          });
        } catch (err) {
          console.error('Error finalizing uploaded video:', err);
          res.status(500).json({ error: 'Internal server error' });
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
            responsibleCpf: data.responsibleCpf
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

          if (!data || !clientId || !data.venueName || !data.addressLine || !data.country || !data.state || !data.city || !data.postalCode) {
            return res.status(400).json({ error: "Client ID, Venue Name, Address Line, Country, State, City and Postal Code are required." });
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
    })()
  })
  .catch(error => {
    console.error("Error initializing Data Source:", error);
  })
