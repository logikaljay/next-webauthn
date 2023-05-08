import { db } from "@/db";
import type { PublicKeyCredentialWithAssertionJSON, PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json"
import type {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse
} from "@simplewebauthn/server"
import { 
  verifyAuthenticationResponse, 
  verifyRegistrationResponse 
} from "@simplewebauthn/server";
import { users } from "@/db/managers/users";

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const HOST_SETTINGS = {
  expectedOrigin: process.env.VERCEL_URL ?? 'http://localhost:3000',
  expectedRPID: process.env.RP_ID ?? 'localhost'
}

function binaryToBase64URL(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('base64url')
}


type UserLike = {
  id: number
  email: string
}

export async function registerPasskey(
  user: UserLike, 
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

  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS
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
      ...HOST_SETTINGS
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