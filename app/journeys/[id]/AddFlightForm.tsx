"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface SearchResult {
  flightNumber: string
  airline: string | null
  origin: string
  destination: string
  originCity: string | null
  destinationCity: string | null
  departureTime: string
  arrivalTime: string
  status: string
  gate: string | null
  terminal: string | null
  delay: number | null
  aircraft: string | null
  rawData: string | null
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fmtPickedDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

export default function AddFlightForm({ journeyId }: { journeyId: string }) {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [flightNumber, setFlightNumber] = useState("")
  const [date, setDate] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const todayStr = toLocalDateStr(new Date())
  const tomorrowStr = toLocalDateStr(new Date(Date.now() + 86_400_000))

  function openNativePicker() {
    if (!dateInputRef.current) return
    try {
      (dateInputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.()
    } catch {
      dateInputRef.current.click()
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!flightNumber.trim()) return
    setError("")
    setSearching(true)
    setResults([])

    const params = new URLSearchParams({ flightNumber: flightNumber.trim().toUpperCase() })
    if (date) params.set("date", date)

    const res = await fetch(`/api/flights/search?${params}`)
    const data = await res.json()
    setSearching(false)

    if (!res.ok) {
      setError(data.error ?? "Search failed")
    } else {
      setResults(data)
      if (data.length === 0) setError("No flights found")
    }
  }

  async function addFlight(result: SearchResult) {
    setAdding(result.flightNumber + result.departureTime)

    const res = await fetch(`/api/journeys/${journeyId}/flights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    })

    setAdding(null)

    if (res.ok) {
      window.location.reload()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#1C1C1E] border border-dashed border-[#3A3A3C] rounded-2xl py-5 text-gray-500 hover:text-gray-300 hover:border-gray-500 active:bg-[#2C2C2E] transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm font-medium">Add Flight</span>
      </button>
    )
  }

  const isCustomDate = date && date !== todayStr && date !== tomorrowStr

  return (
    <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Search Flight</h3>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-2 mb-4">
        {/* Flight number + search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="e.g. BA123"
            required
            className="flex-1 bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm uppercase transition"
          />
          <button
            type="submit"
            disabled={searching || !date}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            {searching ? "…" : "Search"}
          </button>
        </div>

        {/* Date quick-pick row */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDate(todayStr)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              date === todayStr
                ? "bg-blue-600 text-white"
                : "bg-[#2C2C2E] text-gray-400 hover:text-white"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDate(tomorrowStr)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              date === tomorrowStr
                ? "bg-blue-600 text-white"
                : "bg-[#2C2C2E] text-gray-400 hover:text-white"
            }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={openNativePicker}
            className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              isCustomDate
                ? "bg-blue-600 text-white"
                : "bg-[#2C2C2E] text-gray-400 hover:text-white"
            }`}
          >
            <span>{isCustomDate ? fmtPickedDate(date) : "Pick date"}</span>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {/* Hidden native input — opened programmatically */}
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </form>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => {
            const key = r.flightNumber + r.departureTime
            return (
              <div
                key={key}
                className="bg-[#111111] rounded-xl p-3 border border-[#2C2C2E] flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold">{r.flightNumber}</span>
                    {r.airline && <span className="text-gray-500 text-xs">{r.airline}</span>}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {r.origin} → {r.destination}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {new Date(r.departureTime).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => addFlight(r)}
                  disabled={adding === key}
                  className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                >
                  {adding === key ? "Adding…" : "Add"}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
