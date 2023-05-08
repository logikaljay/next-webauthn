import { DB } from "@/db/schema";
import { createKysely } from "@vercel/postgres-kysely";

const db = createKysely<DB>()

export { db }