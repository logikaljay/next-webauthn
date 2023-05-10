"use server"

import { createHash, randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { users } from "@/db/managers/users"
import { z } from "zod"
import { zact } from "zact/server"
import { Selectable } from "kysely"
import { User } from "@/db/schema"
import { storage } from "@/lib/session"

export async function getUser(id?: string | number) {
  let cookieList = cookies()
  return cookieList.get('webauthn-user') ? cookieList.get('webauthn-user').value : null
}

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}


export const testAction = zact(z.object({
  email: z.string().email()
}))(
  async (input) => {
    let user = await users.getUserByEmail(input.email)
    if (user) {
      return { 
        success: true, 
        settings: {
          require_passkey: user.require_passkey
        }
      }
    }
    else {
      return { success: false, error: "Invalid user or password" }
    }
  }
)

export async function getUserSettings(email: string) {
  let user = await users.getUserByEmail(email)
  if (user) {
    return { 
      success: true, 
      settings: {
        require_passkey: user.require_passkey
      }
    }
  }
  else {
    return { success: false, error: "Invalid user or password" }
  }
}

export async function setSessionUser(user: Selectable<User>): Promise<SessionUser> {
  const sessionUser = {
    id: user.id,
    email: user.email,
    image: user.image,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    logged_in_at: new Date().toISOString()
  }
  await storage.set('user', sessionUser)
  return sessionUser
}

export async function destroySessionUser() {
  await storage.destroy()
}