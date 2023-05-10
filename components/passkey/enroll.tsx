"use client"

import { useState } from "react"

import { create } from "@github/webauthn-json"
import { enrollPasskey, generateChallenge, generateRelyParty, revalidate } from "./actions"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideCheck, LucideFingerprint, LucideLoader2 } from "lucide-react"

const apiState = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error"
} as const

export function EnrollPasskey(props: any) {

  const [open, setOpen] = useState<boolean>(false)
  const [state, setState] = useState<keyof typeof apiState>("idle")
  const [name, setName] = useState<string>()

  async function handleEnrollPasskey() {

    setState("loading")
    let rp = await generateRelyParty({})
    let challenge = await generateChallenge({})

    const credential = await create({
      publicKey: {
        challenge,
        rp,
        user: {
          id: window.crypto.randomUUID(),
          name: props.user.email,
          displayName: props.user.email
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        timeout: 60_000,
        attestation: 'direct',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required'
        }
      }
    })

    await enrollPasskey({ user: props.user, credential, name })
    setState("success")
    setTimeout(async () => {
      await revalidate()
      setOpen(false)
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add a passkey</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new passkey</DialogTitle>
          <DialogDescription>
            Adding a passkey allows you add an additional layer of security to your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
            <p className="-mt-3 text-sm text-muted-foreground col-start-2 col-span-3">The name of your passkey device.</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleEnrollPasskey} className="flex space-x-3 py-2 h-auto">
            {state == 'loading' && <LucideLoader2 className="w-6 h-6 animate-spin" />}
            {state == 'idle' && <LucideFingerprint className="w-6 h-6" />}
            {state == 'success' && <LucideCheck className="w-6 h-6" />}
          
            <span>Add passkey</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}