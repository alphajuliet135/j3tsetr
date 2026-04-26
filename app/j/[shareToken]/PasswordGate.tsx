"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PasswordGate({
  shareToken,
  journeyName,
}: {
  shareToken: string
  journeyName: string
}) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch(`/api/j/${shareToken}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.refresh()
    } else {
      setError("Incorrect password")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl">{journeyName}</h1>
          <p className="text-gray-500 text-sm mt-1">This journey is password protected</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base transition text-center tracking-widest"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-3.5 font-semibold transition disabled:opacity-50"
          >
            {loading ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  )
}
