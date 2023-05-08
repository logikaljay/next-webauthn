import * as path from 'path'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely'
import { config } from "dotenv"

config({ path: '.env.local', debug: true })

async function migrateToLatest() {
  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        ssl: true
      }),
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  })

  const direction = process.argv.slice(2)[0] ?? 'latest'

  let error;
  let results

  if (direction === 'up') {
    const migratorResult = await migrator.migrateUp()
    error = migratorResult.error
    results = migratorResult.results
  }
  else if (direction === 'down') {
    const migratorResult = await migrator.migrateDown()
    error = migratorResult.error
    results = migratorResult.results
  }
  else {
    const migratorResult = await migrator.migrateToLatest()
    error = migratorResult.error
    results = migratorResult.results
  }

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was ${direction == 'down' ? 'reverted' : 'applied'} successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateToLatest()