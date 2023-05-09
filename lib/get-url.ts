import { headers } from "next/headers"

export async function getUrl() {
  "use server"

  const headersList = headers()
  return new URL(headersList.get('x-url') || '')
}