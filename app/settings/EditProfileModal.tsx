"use client"

import { useState } from "react"

type Mode = "username" | "password"

export default function EditProfileModal({
  currentUsername,
  onClose,
}: {
  currentUsername: string
  onClose: () => void
}) {
  const [mode, setMode] = useState<Mode>("username")
  const [username, setUsername] = useState(currentUsername)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const body =
      mode === "username"
        ? { username, currentPassword }
        : { currentPassword, newPassword }

    const res = await fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setSaving(false)

    if (res.ok) {
      window.location.reload()
    } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1C1C1E] rounded-2xl p-5 border border-[#2C2C2E] shadow-xl">
        {/* Tab switcher */}
        <div className="flex rounded-xl bg-[#111111] p-1 mb-5">
          {(["username", "password"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError("") }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === m ? "bg-[#2C2C2E] text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m === "username" ? "Change Username" : "Change Password"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          {mode === "username" ? (
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="New username"
              minLength={3}
              maxLength={32}
              required
              className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          ) : (
            <input
              autoFocus
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              minLength={8}
              required
              className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          )}

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 rounded-xl py-2.5 text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
