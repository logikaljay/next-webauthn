import { users } from "@/db/managers/users"
import { requireUser } from "./actions"
import { TogglePasskey } from "./toggle-passkey"
import { Separator } from "@/components/ui/separator"
import { SignOutButton } from "./sign-out"
import { storage } from "@/lib/session"
import { ChangePassword } from "./change-password"
import { PasskeyList } from "@/components/passkey/list"
import { EnrollPasskey } from "@/components/passkey/enroll"
import { redirect } from "next/navigation"
import { destroySessionUser } from "../auth/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function AdminPage() {

  const user = await requireUser()
  const settings = await users.getUserSettings(user.id)
  if (!settings) {
    await destroySessionUser()
    redirect('/auth/login')
  }

  const credentials = await users.getAllCredentialsForUserId(user.id)

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
      <div className="flex flex-row">
        <p className="my-auto">{user.email}</p>
        <Avatar className="ml-auto">
          <AvatarImage src={user.image} />
          <AvatarFallback>{user.email.substring(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>


      <Separator className="my-4" />

      <div className="space-y-3">
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">Your passkeys</h2>

        <PasskeyList 
          credentials={credentials} 
          user={user}
          settings={settings as any} 
        />

        <EnrollPasskey 
          user={user}
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