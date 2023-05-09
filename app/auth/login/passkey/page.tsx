import { users } from "@/db/managers/users";
import { redirect } from "next/navigation";
import { PasskeyLogin } from "@/components/passkey";

export default async function PasskeyPage({ searchParams }) {

  const email = searchParams.email
  const user = await users.getUserByEmail(email)

  if (!user) {
    return redirect('/auth/login')
  }

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        {/* @ts-ignore */}
        <PasskeyLogin email={email} />
      </div>
    </div>
  )
}