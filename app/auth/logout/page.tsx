import { redirect } from "next/navigation";
import { storage } from "@/lib/session";

export default async function AuthLogout() {
  
  await storage.destroy()

  return redirect('/auth/login')
}