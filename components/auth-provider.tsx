"use client"

import { useBroadcastChannel } from "@/lib/broadcast-channel";
import { useRouter } from "next/navigation";
import { createContext, PropsWithChildren } from "react";

type AuthContextProps = {
  authChannel: (data: { event: string }) => void
}

export const AuthContext = createContext<Partial<AuthContextProps>>({})

export function AuthProvider(props: PropsWithChildren) {
  const router = useRouter()

  const authChannel = useBroadcastChannel<{ event: string }>("auth", (e) => {
    if (e.data.event === 'sign_out') {
      router.push('/auth/logout')
    }
  })

  const value = {
    authChannel
  }
  
  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  )
}