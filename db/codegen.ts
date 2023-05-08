import path from "node:path"
import { Cli } from "kysely-codegen"
import { config } from "dotenv"

config({ path: '.env.local', debug: true })

async function main() {
  process.env.DATABASE_URL = process.env.POSTGRES_URL
  let cli = new Cli()
  await cli.run([
    "", 
    "--out-file", path.join(process.cwd(), "./db/schema.ts"),
    "--dialect", "postgres"
  ])
}

main()