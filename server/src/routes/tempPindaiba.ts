import { Router, Request, Response } from "express";
import { pool } from "../config/pg";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  return res.status(200).json({ message: "API Pindaíba está funcionando!" });
});

// Criar uma nova venda
router.post("/", async (req: Request, res: Response) => {
  const { nome, valor } = req.body;

  // Validação básica dos campos obrigatórios
  if (!nome || valor === undefined || valor === null) {
    return res.status(400).json({
      message: "Campos obrigatórios: nome e valor",
      error: "Dados incompletos",
    });
  }

  // Validação do tipo do valor (deve ser numérico)
  if (typeof valor !== "number" && isNaN(Number(valor))) {
    return res.status(400).json({
      message: "O campo valor deve ser um número válido",
      error: "Tipo de dado inválido",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query("INSERT INTO pindaiba_bar.vendas (nome, valor) VALUES ($1, $2) RETURNING *", [
      nome,
      Number(valor),
    ]);

    await client.query("COMMIT");

    const data = result.rows[0];

    return res.status(201).json({
      message: "Venda criada com sucesso",
      data,
    });
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Erro ao fazer rollback:", rollbackError);
    }

    console.error("Falha inesperada ao criar venda:", e);
    return res.status(500).json({
      message: "Falha inesperada ao criar venda",
      details: String(e),
    });
  } finally {
    client.release();
  }
});

export default router;
