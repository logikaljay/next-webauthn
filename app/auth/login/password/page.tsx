import { Separator } from "@/components/ui/separator";
import { CredentialsForm } from "./credentials-form";
import { PasskeyLogin } from "@/components/passkey";
import { users } from "@/db/managers/users";
import { redirect } from "next/navigation";

export default async function CredentialsPage({ searchParams }) {

  const email = searchParams.email
  const user = await users.getUserByEmail(email)
  if (!user) {
    return redirect('/auth/login?error=User not found')
  }

  const credentials = await users.getAllCredentialsForUserId(user.id)

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        <form name="loginWithCredentials" className="space-y-4">
          <CredentialsForm />
          
          {credentials.length > 0 && (
            <>
              <Separator className="my-6">
                <div className="relative -top-2 mx-auto bg-secondary w-10 text-center text-muted-foreground text-xs font-mono">or</div>
              </Separator>
              
              {/* @ts-ignore */}
              <PasskeyLogin email={email} variant="outline" />
            </>
          )}
        </form>
      </div>
    </div>
  )
}