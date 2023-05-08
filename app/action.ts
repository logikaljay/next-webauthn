"use server"
import { cookies } from "next/headers"
import crypto from "node:crypto"

export async function action(e) {
  console.log("this happens on the server", e)
  return { 
    foo: "bar", 
    message: "this gets returned to the client" 
  }
}
