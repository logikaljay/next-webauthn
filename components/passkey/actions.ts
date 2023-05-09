"use server"

import { z } from "zod"
import { zact } from "zact/server"
import { getChallenge, loginPasskey, registerPasskey } from "@/lib/passkey"
import { storage } from "@/lib/session"
import { getUrl } from "@/lib/get-url"
import { revalidatePath } from "next/cache"
import { users } from "@/db/managers/users"

export const verifyPasskey = zact(
  z.object({
    user: z.any(),
    credential: z.any(),
    challenge: z.string()
  })
)(
  async (input) => {
    try {
      const user = input.user
      let success = await loginPasskey(user.email, input.credential, input.challenge)
      delete user.salt
      delete user.hash
      delete user.user_id
      delete user.should_change_password
      delete user.require_passkey
      await storage.set('user', user)
      return { ok: success, value: user }
    }
    catch (err) {
      console.error(err)
      return { ok: false, error: err }
    }
  }
)

export const generateChallenge = zact(
  z.object({}).optional()
)(
  async () => {
    return await getChallenge()
  }
)

export const generateRelyParty = zact(
  z.object({}).optional()
)(
  async () => {
    const url = await getUrl()
    return {
      id: url.host.indexOf('localhost:') > -1 ? 'localhost' : url.host,
      name: url.host.indexOf('localhost:') > -1 ? 'localhost' : url.host.split('.')[0]
    }
  }
)

export const enrollPasskey = zact(
  z.object({
    user: z.any(),
    credential: z.any(),
    name: z.string()
  })
)(
  async (input) => {
    const challenge = await generateChallenge({})
    const user = input.user
    const credential = input.credential
    const name = input.name
    await registerPasskey(user, credential, challenge, name)
  }
)

export const deletePasskey = zact(
  z.object({
    externalId: z.string()
  })
)(
  async (input) => {
    await users.deletePasskey(input.externalId)
  }
)

export async function revalidate() {
  revalidatePath('/admin')
}