// Neon serverless Postgres client wired to Drizzle.
// DATABASE_URL is provisioned by the Neon integration on the Vercel Marketplace.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Provision Neon and pull env vars.");
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export { schema };
