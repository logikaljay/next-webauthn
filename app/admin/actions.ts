"use server"

import { users } from "@/db/managers/users"
import { storage } from "@/lib/session"
import { createHash } from "crypto"
import { z } from "zod"
import { zact } from "zact/server"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function requireUser() {
  let user = await storage.get('user')

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

async function loadUser() {
  let sessionUser = await requireUser()
  if (!sessionUser) {
    return { ok: false, error: "Session not found" }
  }

  let user = await users.getUserByEmail(sessionUser.email)
  if (!user) {
    return { ok: false, error: "User not found" }
  }

  return { ok: true, value: user }
}

export const verifyPassword = zact(
  z.object({
    password: z.string()
  })
)(
  async (input) => {

    let { ok, error, value: user } = await loadUser()
    if (!ok) {
      return { ok, error }
    }

    let hash = user.hash
    let salt = user.salt
    let password = createHash('sha256').update(`${salt}|${input.password}`).digest('hex')
    let isValid = hash === password

    if (!isValid) {
      return { ok: false, error: "Current password is wrong" }
    }

    return { ok: true }
  }
)

export const changePassword = zact(
  z.object({
    password: z.string()
  })
)(
  async (input) => {
    let { ok, error, value: user } = await loadUser()
    if (!ok) {
      return { ok, error }
    }

    user.hash = createHash('sha256').update(`${user.salt}|${input.password}`).digest('hex')
    await users.updateUser(user)

    return { ok: true }
  }
)

export const shouldChangePassword = zact(
  z.boolean()
)(
  async (input) => {
    let { ok, error, value: user } = await loadUser()
    if (!ok) {
      return { ok, error }
    }

    await users.updateSettings(user.id, {
      should_change_password: input
    })

    return { ok: true }
  }
)

export const getUserAgent = zact(
  z.object({}).optional()
)(
  async (input) => {
    let headersList = headers()
    return headersList.get('user-agent')
  }
)

export async function revalidate() {
  await revalidatePath('/admin')
}