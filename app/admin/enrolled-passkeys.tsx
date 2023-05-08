"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicKeyCredentialWithAttestationJSON, create } from "@github/webauthn-json"
import { LucideSmartphone } from "lucide-react"

type EnrolledPasskeyProps = {
  credentials: any[]
  user: any
  settings: {
    require_passkey: boolean
  }
  enrollPasskey: (credential: PublicKeyCredentialWithAttestationJSON) => Promise<void>
  getChallenge: () => Promise<string>
  rp: {
    id: string
    name: string
  }
}

export function EnrolledPasskeys(props: EnrolledPasskeyProps) {

  const credentials = props.credentials

  console.log(`enroll-passkey props`, props)

  async function handleEnrollPasskey() {

    let challenge = await props.getChallenge()

    const credential = await create({
      publicKey: {
        challenge,
        rp: {
          name: props.rp.name,
          id: props.rp.id
        },
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

    props.enrollPasskey(credential)
  }

  return (
    <>
      {credentials.map(credential => (
        <Card key={credential.external_id} className={"w-[240px]"}>
          <CardHeader>
            <CardTitle><LucideSmartphone className="w-6 h-6" /></CardTitle>
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