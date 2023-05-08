"use client"

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
}

export function PasskeyForm(props: any) {

  const router = useRouter()
  const [btnState, setBtnState] = useState<keyof typeof ApiState>("idle")
  const [error, setError] = useState<string | null>()

  async function handlePasskeyLogin(e) {
    e.preventDefault()

    setBtnState("loading")

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
      console.error(err)
    }
  }

  return (
    <form name="loginWithCredentials" className="space-y-4">

      <Button onClick={handlePasskeyLogin} className="flex space-x-3 py-3 h-auto text-lg">
        {btnState == 'loading' && <LucideLoader2 className="w-6 h-6 animate-spin" />}
        {btnState == 'idle' && <LucideFingerprint className="w-6 h-6" />}
        {btnState == 'success' && <LucideCheck className="w-6 h-6" />}
        <span>Continue with passkey</span>
      </Button>

    </form>
  )
}