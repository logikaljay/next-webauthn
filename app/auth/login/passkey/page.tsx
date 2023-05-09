import { PasskeyForm } from "./passkey-form";
import { getChallenge } from "@/lib/passkey";
import { users } from "@/db/managers/users";
import { PublicKeyCredentialWithAssertionJSON } from "@github/webauthn-json";
import { loginPasskey } from "@/lib/passkey";
import { storage } from "@/lib/session";
import { redirect } from "next/navigation";
import { getUrl } from "@/lib/get-url";

export default async function PasskeyPage({ searchParams }) {

  const email = searchParams.email
  const challenge = await getChallenge()
  const user = await users.getUserByEmail(email)

  if (!user) {
    return redirect('/auth/login')
  }

  const credentials = await users.getAllCredentialsForUserId(user.id)
  const url = getUrl()
  const rp = {
    id: url.host
  }

  async function verifyPasskey(credential: PublicKeyCredentialWithAssertionJSON) {
    "use server"

    try {
      let success = await loginPasskey(email, credential, challenge)
      delete user.salt
      delete user.hash
      delete user.user_id
      delete user.should_change_password
      delete user.require_passkey
      await storage.set('user', user)
      return { success, user }
    }
    catch (err) {
      console.error(err)
      return { success: false, message: err.message }
    }
  }

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        <PasskeyForm credentials={credentials} challenge={challenge} rp={rp} verifyPasskey={verifyPasskey} />
      </div>
    </div>
  )
}