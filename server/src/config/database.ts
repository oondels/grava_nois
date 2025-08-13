import { DataSource } from "typeorm";
import { config } from "./dotenv";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.env === 'development', // Keep just in development mode
  logging: false,
  entities: [],
  subscribers: [],
  migrations: [],
})