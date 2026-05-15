"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Flight } from "@prisma/client"

const STATUS = {
  scheduled: { label: "Scheduled", text: "text-gray-400", bg: "bg-gray-800" },
  active: { label: "In Flight", text: "text-blue-400", bg: "bg-blue-950" },
  landed: { label: "Landed", text: "text-green-400", bg: "bg-green-950" },
  cancelled: { label: "Cancelled", text: "text-red-400", bg: "bg-red-950" },
  diverted: { label: "Diverted", text: "text-orange-400", bg: "bg-orange-950" },
  delayed: { label: "Delayed", text: "text-amber-400", bg: "bg-amber-950" },
  incident: { label: "Incident", text: "text-red-400", bg: "bg-red-950" },
  unknown: { label: "Unknown", text: "text-gray-400", bg: "bg-gray-800" },
} as const

function fmt(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function flightProgress(departure: Date | string, arrival: Date | string): number {
  const dep = new Date(departure).getTime()
  const arr = new Date(arrival).getTime()
  const now = Date.now()
  if (now <= dep) return 0
  if (now >= arr) return 100
  return Math.round(((now - dep) / (arr - dep)) * 100)
}

type StatusKey = keyof typeof STATUS

function FlightProgressBar({ departure, arrival }: { departure: Date | string; arrival: Date | string }) {
  const [pct, setPct] = useState(0)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  useEffect(() => {
    function update() {
      setPct(flightProgress(departure, arrival))
      const diff = new Date(arrival).getTime() - Date.now()
      if (diff > 0) {
        const h = Math.floor(diff / 3_600_000)
        const m = Math.floor((diff % 3_600_000) / 60_000)
        const hPart = h > 0 ? `${h} ${h === 1 ? "hour" : "hours"}` : ""
        const mPart = `${m} ${m === 1 ? "minute" : "minutes"}`
        setTimeLeft(`${hPart ? `${hPart} ` : ""}${mPart} left`)
      } else {
        setTimeLeft(null)
      }
    }
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [departure, arrival])

  return (
    <>
      <div className="relative w-full h-1 bg-[#3A3A3C] rounded-full overflow-visible">
        <div
          className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
          style={{ left: `${pct}%` }}
        >
          <svg className="w-5 h-5 text-blue-400 rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
        </div>
      </div>
      <p className="text-gray-600 text-xs mt-3">{fmtDate(departure)}</p>
      <p className="text-blue-400 text-[10px] font-medium tabular-nums">
        {timeLeft ? `${timeLeft} · ${pct}%` : `${pct}%`}
      </p>
    </>
  )
}

const TERMINAL_STATUSES = new Set(["landed", "cancelled", "diverted"])

function DepartureCountdown({ departure }: { departure: Date | string }) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    function calc() {
      const diff = new Date(departure).getTime() - Date.now()
      if (diff <= 0) return null
      const days = Math.floor(diff / 86_400_000)
      const hours = Math.floor((diff % 86_400_000) / 3_600_000)
      const mins = Math.floor((diff % 3_600_000) / 60_000)
      if (days > 0) return `${days}d ${hours}h ${mins}m`
      if (hours > 0) return `${hours}h ${mins}m`
      return `${mins}m`
    }
    setLabel(calc())
    const id = setInterval(() => setLabel(calc()), 60_000)
    return () => clearInterval(id)
  }, [departure])

  return (
    <>
      <div className="flex w-full items-center gap-1.5">
        <div className="flex-1 h-px bg-[#3A3A3C]" />
        <svg className="w-5 h-5 text-gray-500 shrink-0 rotate-90" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
        <div className="flex-1 h-px bg-[#3A3A3C]" />
      </div>
      <p className="text-gray-600 text-xs">{fmtDate(departure)}</p>
      {label && (
        <p className="text-gray-400 text-[10px] font-medium tabular-nums">Departs in {label}</p>
      )}
    </>
  )
}

function deriveStatus(status: string, departureTime: Date | string, arrivalTime: Date | string): string {
  if (TERMINAL_STATUSES.has(status) || status === "cancelled") return status
  const now = Date.now()
  if (now >= new Date(arrivalTime).getTime()) return "landed"
  if (now >= new Date(departureTime).getTime()) return "active"
  return status
}

export default function FlightCard({ flight, journeyId }: { flight: Flight; journeyId?: string }) {
  const router = useRouter()
  const derived = deriveStatus(flight.status, flight.departureTime, flight.arrivalTime)
  const s = STATUS[(derived as StatusKey) ?? "unknown"] ?? STATUS.unknown

  useEffect(() => {
    if (!journeyId || TERMINAL_STATUSES.has(flight.status)) return

    async function refresh() {
      try {
        const res = await fetch(
          `/api/journeys/${journeyId}/flights/${flight.id}/refresh`,
          { method: "POST" }
        )
        if (res.ok) router.refresh()
      } catch { /* ignore network errors */ }
    }

    refresh() // immediately on mount to catch stale data
    const id = setInterval(refresh, 180_000)
    return () => clearInterval(id)
  }, [flight.id, flight.status, journeyId])
  const showProgress = derived === "active"
  const actualDep = flight.delay ? new Date(new Date(flight.departureTime).getTime() + flight.delay * 60_000) : null
  const actualArr = flight.delay ? new Date(new Date(flight.arrivalTime).getTime() + flight.delay * 60_000) : null
  const aircraftReg: string | null = (() => {
    try { return flight.rawData ? (JSON.parse(flight.rawData) as { aircraft?: { registration?: string } }).aircraft?.registration ?? null : null }
    catch { return null }
  })()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Remove ${flight.flightNumber} from this journey?`)) return
    setDeleting(true)
    await fetch(`/api/journeys/${journeyId}/flights/${flight.id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold text-lg tracking-wide">{flight.flightNumber}</span>
          {flight.airline && (
            <span className="text-gray-500 text-sm">{flight.airline}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.text} ${s.bg}`}>
            {s.label}
          </span>
          {journeyId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-600 hover:text-red-400 transition disabled:opacity-40"
              aria-label="Remove flight"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center shrink-0">
          <p className="text-2xl font-bold text-white leading-tight">{flight.origin}</p>
          {actualDep && (derived === "landed" || derived === "active") ? (
            <>
              <p className="text-gray-600 text-xs font-mono line-through">{fmt(flight.departureTime)}</p>
              <p className="text-gray-400 text-sm font-mono">{fmt(actualDep)}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm font-mono">{fmt(flight.departureTime)}</p>
          )}
          {flight.originCity && (
            <p className="text-gray-600 text-xs truncate max-w-[70px]">{flight.originCity}</p>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          {derived === "active" ? (
            <FlightProgressBar departure={actualDep ?? flight.departureTime} arrival={actualArr ?? flight.arrivalTime} />
          ) : derived === "scheduled" ? (
            <DepartureCountdown departure={flight.departureTime} />
          ) : (
            <>
              <div className="flex w-full items-center gap-1.5">
                <div className="flex-1 h-px bg-[#3A3A3C]" />
                <svg
                  className="w-5 h-5 text-gray-500 shrink-0 rotate-90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
                </svg>
                <div className="flex-1 h-px bg-[#3A3A3C]" />
              </div>
              <p className="text-gray-600 text-xs">{fmtDate(flight.departureTime)}</p>
              {derived === "landed" && (
                flight.delay && flight.delay > 0
                  ? <p className="text-red-400 text-[10px] font-medium">+{flight.delay} min late</p>
                  : flight.delay && flight.delay < 0
                    ? <p className="text-green-400 text-[10px] font-medium">{Math.abs(flight.delay)} min early</p>
                    : <p className="text-gray-500 text-[10px] font-medium">Landed on time</p>
              )}
            </>
          )}
          {derived !== "landed" && flight.delay && flight.delay > 0 && (
            <p className="text-amber-400 text-xs font-medium">+{flight.delay}m</p>
          )}
        </div>

        <div className="text-center shrink-0">
          <p className="text-2xl font-bold text-white leading-tight">{flight.destination}</p>
          {actualArr && (derived === "landed" || derived === "active") ? (
            <>
              <p className="text-gray-600 text-xs font-mono line-through">{fmt(flight.arrivalTime)}</p>
              <p className="text-gray-400 text-sm font-mono">{fmt(actualArr)}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm font-mono">{fmt(flight.arrivalTime)}</p>
          )}
          {flight.destinationCity && (
            <p className="text-gray-600 text-xs truncate max-w-[70px]">{flight.destinationCity}</p>
          )}
        </div>
      </div>

      {derived === "active" && (
        <div className="mt-3 pt-3 border-t border-[#2C2C2E]">
          <a
            href={`https://www.flightradar24.com/${flight.flightNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-blue-400 text-xs font-semibold transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Track live on Flightradar24
          </a>
        </div>
      )}

      {(journeyId ? (flight.terminal || flight.gate || flight.aircraft) : flight.aircraft) && (
        <div className="mt-3 pt-3 border-t border-[#2C2C2E] flex gap-4 text-xs text-gray-500">
          {journeyId && flight.terminal && (
            <span>
              Terminal <span className="text-gray-300 font-medium">{flight.terminal}</span>
            </span>
          )}
          {journeyId && flight.gate && (
            <span>
              Gate <span className="text-gray-300 font-medium">{flight.gate}</span>
            </span>
          )}
          {flight.aircraft && (
            <span className="ml-auto text-gray-600">
              {flight.aircraft}{aircraftReg ? ` · ${aircraftReg}` : ""}
            </span>
          )}
        </div>
      )}

    </div>
  )
}
