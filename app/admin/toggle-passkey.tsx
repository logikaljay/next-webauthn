"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

type TogglePasskeyProps = {
  user: { id: number},
  settings: {
    require_passkey: boolean
  }
  togglePasskey: (value: boolean) => Promise<void>
  disabled: boolean
}

export function TogglePasskey(props: TogglePasskeyProps) {

  const [value, setValue] = useState(props.settings.require_passkey)

  async function handleTogglePasskey(e) {
    setValue(!value)
    props.togglePasskey(!value)
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        checked={value}
        onCheckedChange={handleTogglePasskey}
        id="require_passkey" 
        name="require_passkey" 
        disabled={props.disabled}
      />
      <Label htmlFor="require_passkey">Require passkey to log in</Label>
    </div>
  )
}