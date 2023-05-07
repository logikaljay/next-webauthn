import { headers } from "next/headers"

export function getUrl() {
  const headersList = headers()
  return headersList.get('x-url') || ''
}