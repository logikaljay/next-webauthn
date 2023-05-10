"use client"

import { AuthContext } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useBroadcastChannel } from "@/lib/broadcast-channel";
import { useRouter } from "next/navigation";
import { useContext } from "react";

export function SignOutButton(props: any) {
  const router = useRouter()
  const { authChannel } = useContext(AuthContext)

  async function handleSignOut() {
    authChannel({ event: 'sign_out' })
    router.push('/auth/logout')
  }

  return (
    <Button onClick={handleSignOut} className="mr-auto">Sign out</Button>
  )
}