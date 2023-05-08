"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"

export function Continue(props: any) {

  const router = useRouter()
  const user = props.user

  function handleContinue() {
    router.push('/admin')
  }

  function handleLogout() {
    router.push('/auth/logout')
  }

  return (
    <>
      <p className="text-normal">{user.email} is currently logged in. If this is you press continue. Otherwise please sign out.</p>

      <div className="actions flex">
        <form action={props.logoutUser}>
          <Button type="submit" variant="link" size="xl">
            Sign out
          </Button>
        </form>
        
        <Button onClick={handleContinue} type="button" size="xl" className="ml-auto">
          Continue
        </Button>
      </div>
    </>
  )
}