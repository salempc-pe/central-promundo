import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres:postgres@localhost:54322/postgres";

const isSupabase =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com");

// Para Serverless / Next.js con Transaction Pooler (puerto 6543)
const client = postgres(connectionString, {
  prepare: false,
  ssl: isSupabase ? "require" : false,
  max: process.env.NODE_ENV === "production" ? 10 : 3,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export const getDb = () => db;
export type Database = typeof db;
