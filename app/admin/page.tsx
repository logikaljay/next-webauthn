import { users } from "@/db/managers/users"
import { requireUser } from "./actions"
import { TogglePasskey } from "./toggle-passkey"
import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json"
import { registerPasskey, getChallenge } from "@/lib/passkey"
import { Separator } from "@/components/ui/separator"
import { SignOutButton } from "./sign-out"
import { EnrolledPasskeys } from "./enrolled-passkeys"
import { revalidatePath } from "next/cache"
import { storage } from "@/lib/session"
import { ChangePassword } from "./change-password"
import { getUrl } from "@/lib/get-url"

export default async function AdminPage() {

  const user = await requireUser()
  const settings = await users.getUserSettings(user.id)
  const credentials = await users.getAllCredentialsForUserId(user.id)

  const url = await getUrl()
  const rp = {
    id: url.host,
    name: url.host.split('.')[0]
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
    await storage.destroy()
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

      <div className="flex space-x-3">
        <ChangePassword force={settings.should_change_password} />
        <SignOutButton signOut={signOut} />
      </div>
    </div>
  )
}