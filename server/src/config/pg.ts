import { Pool } from 'pg'
import './dotenv'

import postgres from 'postgres'

const tempDbUser = process.env.TEMP_DB_USER || 'postgres'
const tempDbPassword = process.env.TEMP_DB_PASSWORD || 'postgres'
const tempDbHost = process.env.TEMP_DB_HOST || 'localhost'
const tempDbPort = parseInt(process.env.TEMP_DB_PORT || '5432', 10)
const tempDbName = process.env.TEMP_DB_NAME || 'postgres'

export const pool = new Pool({
  user: tempDbUser,
  password: tempDbPassword,
  host: tempDbHost,
  port: tempDbPort,
  database: tempDbName,
})

pool
  .connect()
  .then((client) => {
    console.log(`Conectado ao banco de dados TEMP ${tempDbHost} com sucesso!`)
    client.release()
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco TEMP: ', error)
  })

export const supabaseDb = postgres("postgresql://postgres.okfhfwdvoidzhbejotza:gravanois-admin@aws-0-sa-east-1.pooler.supabase.com:5432/postgres", {
  ssl: 'require'
})
