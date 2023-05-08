"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LucideCheck, LucideLoader2 } from "lucide-react";

import { useZact } from "zact/client"
import { testAction } from "../actions";

const apiState = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error"
}

export function LoginForm(props: any) {

  const router = useRouter()
  const [btnState, setBtnState] = useState<keyof typeof apiState>("idle")
  const [error, setError] = useState<string | null>()

  async function handleGetUserSettings(ev: FormData) {
    const email = ev.get('email') as string

    if (email.length === 0) {
      setError("Invalid email address")
      setBtnState("idle")
      return
    }

    let result = await testAction({ email })
    setTimeout(() => {
      setBtnState("success")

      if (!result.success) {
        setError(result.error)
      }
      else if (result.settings.require_passkey) {
        router.push(`/auth/login/passkey?email=${email}`)
      }
      else {
        router.push(`/auth/login/password?email=${email}`)
      }
    }, 250)

    
  }

  return (
    <form name="loginForm" action={handleGetUserSettings} className="space-y-4">
      <input type="hidden" name="returnTo" value="/admin" />

      <Input autoComplete="email webauthn" name="email" type="email" placeholder="Email address" className="p-4 text-base h-auto" />

      {error && (
        <Alert variant="destructive">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>

          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={() => setBtnState("loading")} variant="default" type="submit" size="xl" className="ml-auto">
        {btnState == "idle" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        )}
        {btnState == "loading" && (
          <LucideLoader2 className="w-6 h-6 animate-spin" />
        )}
        {btnState == "success" && (
          <LucideCheck className="w-6 h-6" />
        )}
      </Button>
    </form>
  )
}