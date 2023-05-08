
import { users } from "@/db/managers/users";
import { verifyPassword } from "../../actions";
import { CredentialsForm } from "./credentials-form";
import { cookies } from "next/headers";
import { session } from "@/lib/session";

export default async function CredentialsPage() {

  async function handleVerifyUser(ev: FormData) {
    "use server"

    const email = ev.get('email') as string
    const inputPassword = ev.get('password') as string

    let user = await users.getUserByEmail(email)
    let isValid = await verifyPassword(user.hash, user.salt, inputPassword)

    if (isValid) {
      delete user.salt
      delete user.hash
      await session.set(user)
      return { success: true, user }
    }
    else {
      return { success: false, error: "Incorrect email or password" }
    }
  }

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        <form name="loginWithCredentials" className="space-y-4">
          <CredentialsForm handleVerifyUser={handleVerifyUser} />
        </form>
      </div>
    </div>
  )
}