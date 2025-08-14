import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { AppDataSource } from './config/database';
import dotenv from 'dotenv';
dotenv.config();

AppDataSource.initialize()
  .then(() => {
    (async () => {
      const app = express();

      app.use(express.json())
      const upload = multer({ storage: multer.memoryStorage() });

      // Initialize Supabase client with service role key (secure, only on server)
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

      // Health check
      app.get("/", (req: Request, res: Response) => {
        res.send("Video upload api is running.");
      })


      /**
       * Recebe metadados do vídeo
       * @param clientId - ID do cliente
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
      app.post("/api/videos/metadados/client/:clientId/", async (req: Request, res: Response) => {
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


