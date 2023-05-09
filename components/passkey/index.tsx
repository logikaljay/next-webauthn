import { PasskeyForm } from "./form";
import { generateChallenge } from "./actions"
import { users } from "@/db/managers/users";
import { redirect } from "next/navigation";
import { getUrl } from "@/lib/get-url";
import { Separator } from "@/components/ui/separator";

interface PasskeyLoginProps {
  email?: string
}

export async function PasskeyLogin(props: PasskeyLoginProps) {

  const email = props.email
  const challenge = await generateChallenge({})
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
  
  if (credentials.length === 0) {
    return <></>
  } 
  
  return (
    <div>
      <Separator className="my-6">
        <div className="relative -top-2 mx-auto bg-secondary w-10 text-center text-muted-foreground text-xs font-mono">or</div>
      </Separator>

      <PasskeyForm
        user={user}
        credentials={credentials}
        challenge={challenge}
        rp={rp}
      />
    </div>

  )
}