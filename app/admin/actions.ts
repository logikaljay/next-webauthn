"use server"

import { storage } from "@/lib/session"

export async function requireUser() {
  let user = await storage.get('user')

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}