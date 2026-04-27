import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";

let instance: ReturnType<typeof drizzle>;

export function getDb() {
  if (!instance) {
    const pool = createPool({
      uri: env.databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    instance = drizzle(pool, { schema, mode: "default" });
  }
  return instance;
}