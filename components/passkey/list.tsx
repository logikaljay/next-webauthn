"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { create } from "@github/webauthn-json"
import { LucideFingerprint } from "lucide-react"
import { enrollPasskey, generateChallenge, generateRelyParty } from "./actions"
import { ConfirmDelete } from "./confirm-delete"
import { DateString } from "../date-string"

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
        <Card key={credential.external_id} className={"w-[185px] bg-muted/20"}>
          <CardHeader>
            <CardTitle className="flex">
              <LucideFingerprint className="w-6 h-6 flex-shrink-0" />
              <span className="my-auto ml-2 truncate break-all block text-xs font-normal">{credential.external_id}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="break-all text-sm flex flex-col">
              <span>Created <DateString date={credential.created_at} /></span>
              <span>Used {credential.sign_count} {credential.sign_count == 1 ? "time" : "times"}</span>
            </CardDescription>
          </CardContent>
          <CardFooter className="pb-2">
            <ConfirmDelete externalId={credential.external_id} />
          </CardFooter>
        </Card>
      ))}

      <Button onClick={handleEnrollPasskey} variant="outline" className="mr-auto">Enroll {credentials.length > 0 ? "another" : "a new"} passkey</Button>
    </>
  )
}