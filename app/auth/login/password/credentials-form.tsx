"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Loading } from "@/components/loading"
import { LucideCheck, LucideKey } from "lucide-react"
import { handleVerifyUser } from "./actions"

const ApiState = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error"
} as const


export function CredentialsForm() {

  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [btnState, setBtnState] = useState<keyof typeof ApiState>("idle")
  
  const [error, setError] = useState<string | null>()

  async function handleLoginClick(e) {
    e.preventDefault()

    setBtnState("loading")

    try {
      let result = await handleVerifyUser({
        email,
        password
      })

      if (result.ok) {
        setBtnState("success")
        setTimeout(() => {
          router.push('/admin')
        }, 250)
      }
      else {
        setError(result.error)
        setBtnState("idle")
      }
    } catch (err) {
      setError(err.message)
      setBtnState("idle")
    }
  }

  return (
    <>
      <Input 
        type="email" 
        value={email} onChange={e => setEmail(e.target.value)} 
        name="email" placeholder="Email address" 
        className="p-4 text-base h-auto" 
      />
      <Input 
        autoFocus
        type="password"
        value={password} onChange={e => setPassword(e.target.value)} 
        name="password" placeholder="Password" 
        className="p-4 text-base h-auto"
      />

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

      <Button onClick={handleLoginClick} type="submit" variant="default" size="xl" className="flex space-x-3 py-3 h-auto text-lg w-full">
        {btnState === "loading" && <Loading className="w-6 h-6" />}
        
        {btnState === "idle" && (
          <LucideKey className="w-6 h-6" />
        )}


        {btnState === "success" && (
          <LucideCheck className="w-6 h-6" />
        )}
        

        <span>Continue with password</span>
      </Button>
    </>
  )
}