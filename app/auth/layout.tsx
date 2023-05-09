import { getUrl } from "@/lib/get-url"
import { getUser } from "./actions"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const user = await getUser()
  const appUrl = getUrl()

  return (
    <div className="flex h-screen flex-col justify-between w-full lg:max-w-[500px] px-[40px] lg:px-[80px] py-[20px] lg:py-[40px] bg-secondary text-secondary-foreground">
      <div className="logo flex flex-row">
        <div className="w-14 h-14 bg-slate-400 mr-4 rounded" />
        <div>
          <p className="text-xl mt-1">webauthn</p>
          <p className="text-sm text-muted-foreground">{appUrl}</p>
        </div>
      </div>

      {children}

      <div className="status flex flex-row">
        {!user
          ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="ml-2 font-medium text-muted-foreground">Not authenticated</p>
            </>
          )
          : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="ml-2 font-medium text-muted-foreground">Authenticated</p>
            </>
          )
        }
      </div>
    </div>
  )
}