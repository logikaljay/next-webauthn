"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideFingerprint } from "lucide-react"
import { ConfirmDelete } from "./confirm-delete"
import { DateString } from "../date-string"
import { RelativeString } from "../relative-string"

type PasskeyListProps = {
  credentials: any[]
  user: any
  settings: {
    require_passkey: boolean
  }
}

export function PasskeyList(props: PasskeyListProps) {

  const credentials = props.credentials

  return (
    <>
      <div className="flex flex-row flex-wrap gap-4">
        {credentials.map(credential => (
          <Card key={credential.external_id} className={"w-[215px] bg-muted/20"}>
            <CardHeader>
              <CardTitle className="flex">
                <LucideFingerprint className="w-6 h-6 flex-shrink-0" />
                <span className="ml-2 my-auto text-base truncate">{credential.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="break-all text-sm flex flex-col space-y-1">
                {/* <span className="font-medium pb-1">Used {credential.sign_count} {credential.sign_count == 1 ? "time" : "times"}</span> */}
                <span>Created <DateString date={credential.created_at} /></span>
                <span>Last used <RelativeString date={credential.updated_at} /></span>
              </CardDescription>
            </CardContent>
            <CardFooter className="pb-2">
              <ConfirmDelete externalId={credential.external_id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}