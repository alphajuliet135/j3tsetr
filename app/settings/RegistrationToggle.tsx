"use client"

import { useEffect, useState } from "react"

export default function RegistrationToggle() {
  const [enabled, setEnabled] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setEnabled(d.allowRegistration))
      .catch(() => {})
  }, [])

  async function toggle() {
    const next = !enabled
    setSaving(true)
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowRegistration: next }),
    })
    setSaving(false)
    if (res.ok) setEnabled(next)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-white text-sm font-medium">Allow new sign-ups</p>
        <p className="text-gray-500 text-xs mt-0.5">Show sign-up link on the login screen</p>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-blue-600" : "bg-gray-700"}`}
        role="switch"
        aria-checked={enabled}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
      </button>
    </div>
  )
}
