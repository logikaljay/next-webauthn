import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { cookies } from "next/headers"
import { randomBytes, createHash, BinaryLike } from "node:crypto"
import { verify, sign } from "jsonwebtoken"

declare module AppSession {
  type Session = {
    id: number
    email: string
    created_at: string | Date
    updated_at: string | Date
  }
}

const hash = (input: BinaryLike) => createHash('sha256').update(input).digest('hex')

const cookieSecret = process.env.COOKIE_SECRET ?? hash(randomBytes(16))
const cookieName = process.env.COOKIE_NAME ?? 'next-cookie'

if (!cookieSecret) {
  console.error("You should supply a cookie secret")
  if (process.env.NODE_ENV === 'production') {
    throw new Error("MISSING_COOKIE_SECRET")
  }
}

export const session = {
  get(): AppSession.Session {
    const cookiesList = cookies()
    let cookie: RequestCookie = cookiesList.get(cookieName)
    if (cookie && cookie.value) {
      return verify(cookie.value, cookieSecret)
    }
  },

  async set(data: AppSession.Session & Record<string, any>) {
    const cookiesList = cookies()
    let token = await new Promise(res => {
      sign(data, cookieSecret, {}, (err, token) => {
        res(token)
      })
    })

    // @ts-ignore
    cookiesList.set(cookieName, token)
  },

  destroy() {
    let cookiesList = cookies()
    // @ts-ignore
    cookiesList.delete(cookieName)
  }
}