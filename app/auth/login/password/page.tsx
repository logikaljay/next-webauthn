import { Separator } from "@/components/ui/separator";
import { CredentialsForm } from "./credentials-form";
import { PasskeyLogin } from "@/components/passkey";

export default async function CredentialsPage({ searchParams }) {

  const email = searchParams.email

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        <form name="loginWithCredentials" className="space-y-4">
          <CredentialsForm />
          
          {/* @ts-ignore */}
          <PasskeyLogin email={email} />
        </form>
      </div>
    </div>
  )
}