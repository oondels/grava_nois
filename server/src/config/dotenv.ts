import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env' : '.env.production'
})

export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'sports_highlights',
  },
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mail_user: process.env.EMAIL_USER || '',
  mail_pass: process.env.EMAIL_PASS || '',
  mail_host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  rabbitmqUrl: process.env.RABBITMQ_URL || '',

  backend_public_url: process.env.BACKEND_PUBLIC_URL || '',

  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || ''
}