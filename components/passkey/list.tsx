"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { create } from "@github/webauthn-json"
import { LucideFingerprint } from "lucide-react"
import { enrollPasskey, generateChallenge, generateRelyParty } from "./actions"

type PasskeyListProps = {
  credentials: any[]
  user: any
  settings: {
    require_passkey: boolean
  }
}

export function PasskeyList(props: PasskeyListProps) {

  const credentials = props.credentials

  console.log(`enroll-passkey props`, props)

  async function handleEnrollPasskey() {

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
        timeout: 60000,
        attestation: 'direct',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required'
        }
      }
    })

    await enrollPasskey({ user: props.user, credential })
  }

  return (
    <>
      {credentials.map(credential => (
        <Card key={credential.external_id} className={"w-[240px] bg-muted/20"}>
          <CardHeader>
            <CardTitle><LucideFingerprint className="w-6 h-6" /></CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="break-all">
              {credential.external_id}
            </CardDescription>
          </CardContent>
          <CardFooter className="pb-2">
            <Button variant="link">Delete</Button>
          </CardFooter>
        </Card>
      ))}

      <Button onClick={handleEnrollPasskey} variant="outline" className="mr-auto">Enroll {credentials.length > 0 ? "another" : "a new"} passkey</Button>
    </>
  )
}