import { storage } from "@/lib/session"
import { getUserSettings } from "../actions"

import { Continue } from "./continue"
import { LoginForm } from "./login-form"

export default async function Page() {

  const user = await storage.get('user')

  return (
    <div>
      <h1 className="text-5xl font-bold">Sign in</h1>
      <div className="mt-6 space-y-6">
        {user
          ? <Continue user={user} />
          : <LoginForm getUserSettings={getUserSettings} />
        }
      </div>
    </div>
  )
}