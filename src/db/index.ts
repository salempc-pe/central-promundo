import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres";

// Para Serverless / Next.js es recomendable deshabilitar prefetch y limitar conexiones
const client = postgres(connectionString, {
  prepare: false,
  max: process.env.NODE_ENV === "production" ? 10 : 1,
});

export const db = drizzle(client, { schema });
export const getDb = () => db;
export type Database = typeof db;
