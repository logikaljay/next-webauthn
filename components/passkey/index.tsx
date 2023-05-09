import { PasskeyForm } from "./form";
import { generateChallenge } from "./actions"
import { users } from "@/db/managers/users";
import { redirect } from "next/navigation";
import { getUrl } from "@/lib/get-url";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";

interface PasskeyLoginProps {
  email?: string
  variant?: typeof Button["defaultProps"]["variant"]
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

  console.log(`challenge`, challenge)
  
  return (
    <PasskeyForm
      user={user}
      credentials={credentials}
      challenge={challenge}
      rp={rp}
      variant={props.variant}
    />
  )
}