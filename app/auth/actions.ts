"use server"

import { createHash, randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { users } from "@/db/managers/users"
import { z } from "zod"
import { zact } from "zact/server"

export async function getUser(id?: string | number) {
  let cookieList = cookies()
  return cookieList.get('webauthn-user') ? cookieList.get('webauthn-user').value : null
}

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// export async function getChallenge() {

//   if (cookies().get('webauthn-challenge')) {
//     return cookies().get('webauthn-challenge').value
//   }

//   let challenge = clean(randomBytes(32).toString("base64"));
//   // @ts-ignore
//   cookies().set('webauthn-challenge', challenge)

//   return challenge
// }

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

export async function logoutUser() {
  // @ts-ignore
  cookies().delete('webauthn-user')
  revalidatePath("/auth")
}
