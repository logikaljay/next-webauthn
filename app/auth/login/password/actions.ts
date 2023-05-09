"use server"

import { users } from "@/db/managers/users"
import { storage } from "@/lib/session"
import { createHash } from "node:crypto"
import { z } from "zod"
import { zact } from "zact/server"

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

    console.log(`isValid`, isValid)
    console.log(`user`, user)
    console.log(`input`, input)

    if (!isValid) {
      return { ok: false, error: "Invalid user or password" }
    }

    await storage.set('user', {
      id: user.id,
      email: user.email,
    })
    
    return { ok: true}
  }
)

export type HandleVerifyUser = typeof handleVerifyUser