"use server"

import { users } from "@/db/managers/users"
import { storage } from "@/lib/session"
import { createHash } from "node:crypto"
import { z } from "zod"
import { zact } from "zact/server"
import { setSessionUser } from "../../actions"

export async function verifyPassword(hash: string, salt: string, inputPassword: string) {
  return createHash('sha256').update(`${salt}|${inputPassword}`).digest('hex') === hash
}

export const handleVerifyUser = zact(
  z.object({
    email: z.string().email(),
    password: z.string()
  })
)(
  async (input) => {
    const user = await users.getUserByEmail(input.email)
    if (!user) {
      return { ok: false, error: "Invalid user or password" }
    }

    const isValid = await verifyPassword(user.hash, user.salt, input.password)
    if (!isValid) {
      return { ok: false, error: "Invalid user or password" }
    }

    let sessionUser = await setSessionUser(user)    
    if (!sessionUser) {
      return { ok: false, error: "Could not create a session" }
    }

    return { ok: true}
  }
)

export type HandleVerifyUser = typeof handleVerifyUser