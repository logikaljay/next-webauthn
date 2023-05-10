import type { DB } from "./schema"
import crypto from "node:crypto"
import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import { config } from "dotenv"

config({ path: '.env.local', debug: true })

async function main() {

  const db = new Kysely<DB>({
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

  console.log(`cleaning up old data..`)
  await db.deleteFrom('credential').execute()
  await db.deleteFrom('user_setting').execute()
  await db.deleteFrom('user').execute()

  const email = `admin@example.com`
  const salt = crypto.randomBytes(6).toString('hex')
  const randomPassword = crypto.randomUUID().replace(/-/g, '')
  const hash = crypto.createHash('sha256').update(`${salt}|${randomPassword}`).digest('hex')
  const emailHash = crypto.createHash('md5').update(email).digest('hex')
  const image = `https://www.gravatar.com/avatar/${emailHash}.jpg?s=200&d=robohash`

  console.log(`creating users`)
  const user = await db.insertInto('user')
    .values({
      email,
      salt,
      hash,
      image
    })
    .returning('id')
    .executeTakeFirst()
  
  await db.insertInto('user_setting')
    .values({
      should_change_password: true,
      require_passkey: false,
      user_id: user.id
    })
    .execute()

  await db.destroy()
  
  console.log(` email: ${email}\n password: ${randomPassword}\n`)
  console.log(`🌱 finished seeding database`)

}

main()