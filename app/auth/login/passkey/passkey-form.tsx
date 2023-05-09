"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PublicKeyCredentialDescriptorJSON, get } from "@github/webauthn-json";
import { LucideCheck, LucideFingerprint, LucideLoader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ApiState = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error"
} as const

export function PasskeyForm(props: any) {

  const router = useRouter()
  const [btnState, setBtnState] = useState<keyof typeof ApiState>("idle")
  const [error, setError] = useState<string | null>()

  
  async function handlePasskeyLogin(e) {
    e.preventDefault()
    
    setBtnState("loading")
    console.log('challenge', props.challenge)

    try {

      const credential = await get({
        publicKey: {
          challenge: props.challenge,
          timeout: 60_000,
          userVerification: 'required',
          rpId: props.rp.id,
          allowCredentials: props.credentials
            .map((credential): PublicKeyCredentialDescriptorJSON => ({
              id: credential.external_id,
              type: 'public-key',
              transports: ["hybrid", "internal", "ble", "nfc", "usb"]
            }))
        }
      })

      let result = await props.verifyPasskey(credential)
      if (!result.success) {
        setError(result.message)
      }
      else {
        setBtnState("success")
        setTimeout(() => {
          router.push("/admin")
        }, 250)
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setBtnState("idle")
        return
      }
      setError(err.message)
      console.error(err)
    }
  }

  return (
    <form name="loginWithCredentials" className="space-y-4">

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

      <Button onClick={handlePasskeyLogin} className="flex space-x-3 py-3 h-auto text-lg">
        {btnState == 'loading' && <LucideLoader2 className="w-6 h-6 animate-spin" />}
        {btnState == 'idle' && <LucideFingerprint className="w-6 h-6" />}
        {btnState == 'success' && <LucideCheck className="w-6 h-6" />}
        <span>Continue with passkey</span>
      </Button>

    </form>
  )
}