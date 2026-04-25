"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="text-red-400 hover:text-red-300 text-sm font-medium transition"
    >
      Sign out
    </button>
  )
}
