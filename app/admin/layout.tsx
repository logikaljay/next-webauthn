"use client"

import { AuthProvider } from "@/components/auth-provider"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}