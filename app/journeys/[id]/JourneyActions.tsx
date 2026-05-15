"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Journey } from "@prisma/client"

export default function JourneyActions({
  journey,
  shareUrl,
}: {
  journey: Journey
  shareUrl: string
}) {
  const router = useRouter()
  const [isShared, setIsShared] = useState(journey.isShared)
  const [autoDelete, setAutoDelete] = useState(journey.autoDelete)
  const [isProtected, setIsProtected] = useState(!!journey.sharePassword)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(journey.name)
  const [descInput, setDescInput] = useState(journey.description ?? "")
  const [editSaving, setEditSaving] = useState(false)

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameInput.trim()) return
    setEditSaving(true)
    const res = await fetch(`/api/journeys/${journey.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim(), description: descInput.trim() || null }),
    })
    setEditSaving(false)
    if (res.ok) {
      setEditing(false)
      router.refresh()
    }
  }

  async function toggleShare() {
    const res = await fetch(`/api/journeys/${journey.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isShared: !isShared }),
    })
    if (res.ok) {
      setIsShared(!isShared)
      router.refresh()
    }
  }

  async function toggleAutoDelete() {
    const next = !autoDelete
    const res = await fetch(`/api/journeys/${journey.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoDelete: next }),
    })
    if (res.ok) setAutoDelete(next)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError("")
    setPasswordSaving(true)
    const res = await fetch(`/api/journeys/${journey.id}/share-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    })
    const data = await res.json()
    setPasswordSaving(false)
    if (res.ok) {
      setIsProtected(data.protected)
      setPasswordInput("")
    } else {
      setPasswordError(data.error ?? "Failed to save")
    }
  }

  async function removePassword() {
    setPasswordSaving(true)
    const res = await fetch(`/api/journeys/${journey.id}/share-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: null }),
    })
    setPasswordSaving(false)
    if (res.ok) setIsProtected(false)
  }

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/journeys/${journey.id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/journeys")
      router.refresh()
    } else {
      setDeleting(false)
    }
  }

  return (
    <div className="mb-5">
      <div className="flex items-start gap-3 mb-4">
        <Link href="/journeys" className="text-gray-400 hover:text-white mt-0.5 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{journey.name}</h1>
            {journey.description && (
              <p className="text-gray-500 text-sm mt-0.5">{journey.description}</p>
            )}
          </div>
          <button
            onClick={() => { setNameInput(journey.name); setDescInput(journey.description ?? ""); setEditing(true) }}
            className="text-gray-600 hover:text-gray-300 transition shrink-0"
            aria-label="Edit journey"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmingDelete(true)}
            disabled={deleting}
            className="text-gray-600 hover:text-red-400 transition disabled:opacity-40 shrink-0"
            aria-label="Delete journey"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
      </div>

      <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] space-y-3">
        {/* Share toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Share Journey</p>
            <p className="text-gray-500 text-xs mt-0.5">Let anyone view this journey</p>
          </div>
          <button
            onClick={toggleShare}
            className={`relative w-12 h-6 rounded-full transition-colors ${isShared ? "bg-blue-600" : "bg-gray-700"}`}
            role="switch"
            aria-checked={isShared}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isShared ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        {isShared && (
          <div className="pt-2 border-t border-[#2C2C2E] space-y-3">
            {/* Share URL */}
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-xs truncate flex-1 font-mono">{shareUrl}</p>
              <button
                onClick={copyShareUrl}
                className="shrink-0 text-blue-400 hover:text-blue-300 text-xs font-medium transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Password protection */}
            <div className="pt-2 border-t border-[#2C2C2E]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-white text-sm font-medium">
                    Password protect
                    {isProtected && (
                      <span className="ml-2 text-xs font-normal text-green-400">Active</span>
                    )}
                  </p>
                </div>
                {isProtected && (
                  <button
                    onClick={removePassword}
                    disabled={passwordSaving}
                    className="text-red-400 hover:text-red-300 text-xs transition disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>

              {!isProtected ? (
                <form onSubmit={savePassword} className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Set a password…"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    minLength={4}
                    required
                    className="flex-1 bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
                  />
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-50"
                  >
                    {passwordSaving ? "…" : "Set"}
                  </button>
                </form>
              ) : (
                <p className="text-gray-500 text-xs">Viewers must enter a password to see this journey.</p>
              )}

              {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
            </div>
          </div>
        )}

        {/* Auto-delete toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2C2C2E]">
          <div>
            <p className="text-white text-sm font-medium">Auto-delete when complete</p>
            <p className="text-gray-500 text-xs mt-0.5">Delete journey once all flights have landed</p>
          </div>
          <button
            onClick={toggleAutoDelete}
            className={`relative w-12 h-6 rounded-full transition-colors ${autoDelete ? "bg-blue-600" : "bg-gray-700"}`}
            role="switch"
            aria-checked={autoDelete}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoDelete ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1C1C1E] rounded-2xl p-5 border border-[#2C2C2E] shadow-xl">
            <h2 className="text-white font-semibold text-base mb-1">Delete journey?</h2>
            <p className="text-gray-400 text-sm mb-5">
              <span className="text-white font-medium">{journey.name}</span> and all its flights will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1C1C1E] rounded-2xl p-5 border border-[#2C2C2E] shadow-xl">
            <h2 className="text-white font-semibold text-base mb-4">Edit Journey</h2>
            <form onSubmit={saveEdit} className="flex flex-col gap-3">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                placeholder="Journey name"
                className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm font-semibold placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <input
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <div className="flex gap-2 mt-1">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setNameInput(journey.name); setDescInput(journey.description ?? "") }}
                  className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 rounded-xl py-2.5 text-sm font-semibold transition"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
