import { CredentialsForm } from "./credentials-form";

export default async function CredentialsPage() {

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        <form name="loginWithCredentials" className="space-y-4">
          <CredentialsForm />
        </form>
      </div>
    </div>
  )
}