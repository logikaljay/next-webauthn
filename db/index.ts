import { DB } from "@/db/schema";
import { createKysely } from "@vercel/postgres-kysely"
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"

let db: Kysely<DB>;

if (process.env.VERCEL_URL) {
  db = createKysely<DB>()
}
else {
  db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        ssl: process.env.POSTGRES_SSL !== "false"
      }),
    }),
  })
}

export { db }