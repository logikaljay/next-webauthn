import { users } from "@/db/managers/users"
import { requireUser } from "./actions"
import { TogglePasskey } from "./toggle-passkey"
import { getChallenge } from "../auth/actions"
import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json"
import { registerPasskey } from "@/lib/passkey"
import { Separator } from "@/components/ui/separator"
import { session } from "@/lib/session"
import { SignOutButton } from "./sign-out"
import { EnrolledPasskeys } from "./enrolled-passkeys"
import { revalidatePath } from "next/cache"

export default async function AdminPage() {

  const user = await requireUser()
  const settings = await users.getUserSettings(user.id)
  const credentials = await users.getAllCredentialsForUserId(user.id)

  const rp = {
    id: process.env.RP_ID,
    name: process.env.RP_NAME
  }
  
  async function handleGetChallenge() {
    "use server"
    return await getChallenge()
  }

  async function enrollPasskey(credential: PublicKeyCredentialWithAttestationJSON) {
    "use server"
    console.log('enrolling passkey', credential)
    const challenge = await getChallenge()
    
    await registerPasskey(user, credential, challenge)
    revalidatePath('/admin')
  }

  async function signOut() {
    "use server"
    session.destroy()
  }

  async function togglePasskey(value: boolean) {
    "use server"
    await users.updateSettings(user.id, {
      require_passkey: value,
    })
  }

  return (
    <div className="flex flex-col space-y-4 m-10">
      <p>Welcome, {user.email}</p>

      <Separator className="my-4" />


      <div className="space-y-3">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">Your passkeys</h2>

        <EnrolledPasskeys 
          credentials={credentials} 
          rp={rp}
          user={user}
          settings={settings as any} 
          enrollPasskey={enrollPasskey} 
          getChallenge={handleGetChallenge}  
        />

        <TogglePasskey 
          user={user}
          settings={settings as any} 
          togglePasskey={togglePasskey}
          disabled={credentials.length === 0}
        />
      </div>
    

      <Separator className="my-4" />

      <SignOutButton signOut={signOut} />
    </div>
  )
}