"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { StayBreak } from "@prisma/client"

function fmtRange(start: Date | string, end: Date | string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const nights = Math.round((e.getTime() - s.getTime()) / 86_400_000)
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)} · ${nights} night${nights !== 1 ? "s" : ""}`
}

export default function BreakCard({
  stayBreak,
  journeyId,
  readonly = false,
}: {
  stayBreak: StayBreak
  journeyId: string
  readonly?: boolean
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Remove "${stayBreak.title}"?`)) return
    setDeleting(true)
    await fetch(`/api/journeys/${journeyId}/breaks/${stayBreak.id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="relative flex gap-3 px-1 py-1">
      <div className="flex flex-col items-center pt-1">
        <div className="w-px flex-1 bg-[#3A3A3C]" />
        <div className="w-2 h-2 rounded-full bg-[#3A3A3C] my-1 shrink-0" />
        <div className="w-px flex-1 bg-[#3A3A3C]" />
      </div>

      <div className="flex-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm">{stayBreak.title}</p>
            {stayBreak.location && (
              <p className="text-gray-500 text-xs mt-0.5">{stayBreak.location}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">{fmtRange(stayBreak.startDate, stayBreak.endDate)}</p>
            {stayBreak.notes && (
              <p className="text-gray-500 text-xs mt-1.5 italic">{stayBreak.notes}</p>
            )}
          </div>
          {!readonly && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-600 hover:text-red-400 transition shrink-0 disabled:opacity-40"
              aria-label="Remove break"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
