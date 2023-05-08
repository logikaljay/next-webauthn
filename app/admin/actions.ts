"use server"

import { session } from "@/lib/session"

export async function requireUser() {
  let user = await session.get()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}