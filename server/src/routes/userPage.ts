import { Router, Request, Response } from 'express'
import { supabaseDb } from '../config/pg'

export const userRouter = Router()

userRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id

    const user = await supabaseDb`
    select
      name, avatar_url, state, city, country, quadras, provider
    from grn_auth.profiles
    where user_id = ${userId}
  `

    res.status(200).json({
      message: "Usuario encontrado com sucesso",
      user: user[0] || null
    })
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error)

    res.status(500).json({
      status: 500,
      message: "Erro ao buscar usuário",
      error: error.message
    })
  }
})