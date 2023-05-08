"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton(props: any) {
  const router = useRouter()

  async function handleSignOut() {
    await props.signOut()
    router.push('/auth/login')
  }

  return (
    <Button onClick={handleSignOut} className="mr-auto">Sign out</Button>
  )
}