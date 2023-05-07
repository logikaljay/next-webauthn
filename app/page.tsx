"use client";

import { FormEvent } from "react"
import { action } from "./action"

export default function Index() {

  async function submitData(ev: FormEvent) {
    let result = await action({ firstName: "jimbob" })
    console.log(result)
  }
  
  return (
    <div className="p-10 flex flex-col">
      <button onClick={submitData}>Submit</button>
    </div>
  )
}