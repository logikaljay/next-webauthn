import { cookies } from "next/headers"
import { randomBytes, createHash, BinaryLike } from "node:crypto"
import { db } from "@/db"
import { sql } from "kysely"

declare global {
  interface SessionUser {
    id: number
    email: string
    image: string
    created_at: string
    updated_at: string
    logged_in_at: string
  }

  interface Session {
    user?: SessionUser
  }
}

const hash = (input: BinaryLike) => createHash('sha256').update(input).digest('hex') 
const cookieSecret = process.env.COOKIE_SECRET ?? hash(randomBytes(12))
const cookieName = process.env.COOKIE_NAME ?? 'app-session'

if (!cookieSecret) {
  console.error("You should supply a cookie secret")
  if (process.env.NODE_ENV === 'production') {
    throw new Error("MISSING_COOKIE_SECRET")
  }
}

function getSessionKey() {
  let cookiesList = cookies()
  return cookiesList.get(cookieName).value
}

const storage = {
  async get<T extends Session, K extends keyof T>(key: K) {
    let sessionKey = getSessionKey()
    let value = await db.selectFrom('session')
      .where('key', '=', sessionKey)
      .select(['data'])
      .executeTakeFirst()
    return value?.data[key as string] as T[K]
  },

  async getAll<T extends Session>() {
    let sessionKey = getSessionKey()
    let result = await db.selectFrom('session')
      .where('key', '=', sessionKey)
      .select('data')
      .executeTakeFirst()
    return result.data ?? {} as T
  },

  async set<T extends Session, K extends keyof T>(key: K, value: T[K]) {
    let sessionKey = getSessionKey()
    await db.insertInto('session')
      .values({
        key: sessionKey,
        data: JSON.stringify({
          [key]: value
        })
      })
      .onConflict(oc => {
        return oc.column('key').doUpdateSet({
          data: sql`session."data"::jsonb || ${JSON.stringify({ [key]: value })}::jsonb`
        })
      })
      .execute()
  },

  async destroy() {
    let sessionKey = getSessionKey()
    await db.deleteFrom('session')
      .where('key', '=', sessionKey)
      .execute()
  }
}

export { storage }