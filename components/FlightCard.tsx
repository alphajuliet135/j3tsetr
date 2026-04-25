"use client"

import { useEffect, useState } from "react"
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
  const [pct, setPct] = useState(() => flightProgress(departure, arrival))

  useEffect(() => {
    const id = setInterval(() => setPct(flightProgress(departure, arrival)), 30_000)
    return () => clearInterval(id)
  }, [departure, arrival])

  return (
    <div className="mt-3 pt-3 border-t border-[#2C2C2E]">
      <div className="relative h-1 bg-[#3A3A3C] rounded-full overflow-visible">
        <div
          className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
          style={{ left: `${pct}%` }}
        >
          <svg className="w-4 h-4 text-blue-400 rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
        </div>
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-gray-600">
        <span>{fmt(departure)}</span>
        <span className="text-blue-400">{pct}%</span>
        <span>{fmt(arrival)}</span>
      </div>
    </div>
  )
}

export default function FlightCard({ flight }: { flight: Flight }) {
  const s = STATUS[(flight.status as StatusKey) ?? "unknown"] ?? STATUS.unknown
  const showProgress = flight.status === "active" || flight.status === "scheduled"

  return (
    <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold text-lg tracking-wide">{flight.flightNumber}</span>
          {flight.airline && (
            <span className="text-gray-500 text-sm">{flight.airline}</span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.text} ${s.bg}`}>
          {s.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center shrink-0">
          <p className="text-2xl font-bold text-white leading-tight">{flight.origin}</p>
          <p className="text-gray-400 text-sm font-mono">{fmt(flight.departureTime)}</p>
          {flight.originCity && (
            <p className="text-gray-600 text-xs truncate max-w-[70px]">{flight.originCity}</p>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
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
          {flight.delay && flight.delay > 0 ? (
            <p className="text-amber-400 text-xs font-medium">+{flight.delay}m</p>
          ) : null}
        </div>

        <div className="text-center shrink-0">
          <p className="text-2xl font-bold text-white leading-tight">{flight.destination}</p>
          <p className="text-gray-400 text-sm font-mono">{fmt(flight.arrivalTime)}</p>
          {flight.destinationCity && (
            <p className="text-gray-600 text-xs truncate max-w-[70px]">{flight.destinationCity}</p>
          )}
        </div>
      </div>

      {(flight.terminal || flight.gate || flight.aircraft) && (
        <div className="mt-3 pt-3 border-t border-[#2C2C2E] flex gap-4 text-xs text-gray-500">
          {flight.terminal && (
            <span>
              Terminal <span className="text-gray-300 font-medium">{flight.terminal}</span>
            </span>
          )}
          {flight.gate && (
            <span>
              Gate <span className="text-gray-300 font-medium">{flight.gate}</span>
            </span>
          )}
          {flight.aircraft && (
            <span className="ml-auto text-gray-600">{flight.aircraft}</span>
          )}
        </div>
      )}

      {showProgress && (
        <FlightProgressBar departure={flight.departureTime} arrival={flight.arrivalTime} />
      )}
    </div>
  )
}
