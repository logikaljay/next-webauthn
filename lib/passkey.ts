"use server"

import { db } from "@/db";
import type { PublicKeyCredentialWithAssertionJSON, PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json"
import type { VerifiedAuthenticationResponse, VerifiedRegistrationResponse } from "@simplewebauthn/server"
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server"
import { users } from "@/db/managers/users"
import { storage } from "./session"
import { randomBytes } from "node:crypto"
import { getUrl } from "./get-url";

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const HOST_SETTINGS = (url: URL) => ({
  expectedOrigin: url.origin.indexOf('localhost:') > -1 ? 'localhost' : url.origin,
  expectedRPID: url.host.indexOf('localhost:') > -1 ? 'localhost' : url.host
})

function binaryToBase64URL(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64url')
}

declare global {
  interface Session {
    challenge: string
  }
}

export async function getChallenge() {
  let challenge = await storage.get('challenge') as string
  if (!challenge) {
    let challenge = clean(randomBytes(32).toString("base64"));
    await storage.set('challenge', challenge)
  }

  return challenge
}

export async function registerPasskey(
  user: SessionUser, 
  credential: PublicKeyCredentialWithAttestationJSON, 
  challenge: string
) {
  let verification: VerifiedRegistrationResponse

  if (credential == null) {
    throw new Error("Invalid credentials")
  }

  if (!user) {
    throw new Error("User not found")
  }

  const url = await getUrl()

  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS(url)
    })
  } catch (err) {
    console.error(err)
    throw err
  }

  if (!verification.verified) {
    throw new Error("Registration verification failed")
  }

  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {}
  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed")
  }

  await db.insertInto('credential')
    .values({
      external_id: clean(binaryToBase64URL(credentialID)),
      public_key: Buffer.from(credentialPublicKey).toString('base64'),
      user_id: user.id
    })
    .execute()

  return true
}

export async function loginPasskey(email: string, credential: PublicKeyCredentialWithAssertionJSON, challenge: string) {
  if (credential == null) {
    throw new Error("Invalid credential")
  }

  if (email.length == 0) {
    throw new Error("Invalid email")
  }

  const user = await users.getUserCredential(credential.id)
  if (!user) {
    throw new Error("Unknown user")
  }
  if (!user.public_key) {
    throw new Error("Unknown credential")
  }

  const url = await getUrl()

  let verification: VerifiedAuthenticationResponse
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: Uint8Array.from(Buffer.from(user.external_id, 'base64')),
        credentialPublicKey: Uint8Array.from(Buffer.from(user.public_key, 'base64')),
        counter: user.sign_count as number
      },
      ...HOST_SETTINGS(url)
    })

    await users.updateCredentialSignCount(user.external_id, verification.authenticationInfo.newCounter)
  }
  catch (err) {
    console.error(err)
    throw err
  }

  if (!verification.verified || email !== user.email) {
    throw new Error("Could not verify passkey")
  }

  return true
}