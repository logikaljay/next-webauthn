import { cookies } from "next/headers"
import bcryptjs from "bcryptjs"
import kv from "@vercel/kv"

declare global {
  interface SessionUser {
    id: number
    email: string
  }

  interface Session {
    user?: SessionUser
  }
}

// const hash = (input: BinaryLike) => createHash('sha256').update(input).digest('hex') 
const cookieSecret = process.env.COOKIE_SECRET ?? bcryptjs.hashSync(crypto.randomUUID())
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
    return await kv.hget(sessionKey, key as string) as T[K] | null
  },

  async getAll<T extends Session>() {
    let sessionKey = getSessionKey()
    return await kv.hgetall(sessionKey) ?? {} as T
  },

  async set<T extends Session, K extends keyof T>(key: K, value: T[K]) {
    let sessionKey = getSessionKey()
    await kv.hset(sessionKey, { [key]: value })
  },

  async destroy() {
    let sessionKey = getSessionKey()
    await kv.del(sessionKey)
  }
}

export { storage }