import { PasskeyForm } from "@/components/passkey/form";
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
  const url = await getUrl()
  const rp = {
    id: url.host.indexOf('localhost:') > -1 ? 'localhost' : url.host,
    name: url.host.indexOf('localhost:') > -1 ? 'localhost' : url.host.split('.')[0]
  }

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        <PasskeyForm
          user={user}
          credentials={credentials}
          challenge={challenge}
          rp={rp}
          variant="default"
        />
      </div>
    </div>
  )
}