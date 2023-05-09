"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideCheck, LucideLoader2 } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { changePassword, revalidate, shouldChangePassword, verifyPassword } from "./actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty("You must supply your current password"),
  newPassword: z.string().nonempty("You must supply a new password"),
  confirmPassword: z.string().nonempty("You must confirm your new password")
})
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Your new passwords do not match",
        path: ["confirmPassword"]
      })
    }
  })

const apiState = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error"
} as const

type ChangePasswordProps = {
  force: boolean
}

export function ChangePassword(props: ChangePasswordProps) {

  const [open, setOpen] = useState(props.force);
  const [state, setState] = useState<keyof typeof apiState>("idle")
  const [error, setError] = useState<string | null>()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema)
  })

  async function onValidSubmit(values) {
    setState("loading")

    let verifyResult = await verifyPassword({ password: values.currentPassword })
    if (!verifyResult.ok) {
      setState("error")
      setError(verifyResult.error)
      return
    }

    let changePasswordResult = await changePassword({ password: values.newPassword })
    if (!changePasswordResult.ok) {
      setState("error")
      setError(changePasswordResult.error)
    }

    await shouldChangePassword(false)
    await revalidate()

    setState("success")
    setTimeout(() => {
      setOpen(false)
    }, 250)
  }

  function handleOpenChange() {
    if (props.force) {
      return
    }

    setOpen(!open)
  }

  function onInvalidSubmit(errors) {
    setState("error")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} defaultOpen={props.force}>
      <DialogTrigger asChild>
        <Button variant="outline">Change password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
      <form onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            To change your password, please supply the details below. Click save changes when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Current password
            </Label>
            <Input type="password" {...register('currentPassword')} className="col-span-2" />
            {'currentPassword' in errors && (
              <p className="-mt-3 col-start-2 col-span-2 text-sm text-destructive">{errors.currentPassword.message.toString()}</p>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              New password
            </Label>
            <Input type="password" {...register('newPassword')} className="col-span-2" />
            {'newPassword' in errors && (
              <p className="-mt-3 col-start-2 col-span-2 text-sm text-destructive">{errors.newPassword.message.toString()}</p>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Confirm password
            </Label>
            <Input type="password" {...register('confirmPassword')} className="col-span-2" />
            {'confirmPassword' in errors && (
              <p className="-mt-3 col-start-2 col-span-2 text-sm text-destructive">{errors.confirmPassword.message.toString()}</p>
            )}
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>

            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          
          <Button type="submit" className="flex space-x-2">
            {state === "loading" && <LucideLoader2 className="w-5 h-5 animate-spin" />}
            {state === "success" && <LucideCheck className="w-5 h-5" />}

            <span>Save changes</span>
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}