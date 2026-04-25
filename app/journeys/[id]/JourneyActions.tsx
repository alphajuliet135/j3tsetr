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
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${journey.name}"? This cannot be undone.`)) return
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
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-600 hover:text-red-400 transition"
          aria-label="Delete journey"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Share Journey</p>
            <p className="text-gray-500 text-xs mt-0.5">Let anyone view this journey</p>
          </div>
          <button
            onClick={toggleShare}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isShared ? "bg-blue-600" : "bg-gray-700"
            }`}
            role="switch"
            aria-checked={isShared}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isShared ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {isShared && (
          <div className="pt-2 border-t border-[#2C2C2E]">
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-xs truncate flex-1 font-mono">{shareUrl}</p>
              <button
                onClick={copyShareUrl}
                className="shrink-0 text-blue-400 hover:text-blue-300 text-xs font-medium transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
