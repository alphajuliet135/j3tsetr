"use client"

import { useEffect, useState } from "react"

function calcCountdown(target: Date): string | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const mins = Math.floor((diff % 3_600_000) / 60_000)
  const secs = Math.floor((diff % 60_000) / 1_000)

  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`
  return `${mins}m ${secs}s`
}

export default function JourneyCountdown({
  nextDeparture,
  flightNumber,
}: {
  nextDeparture: string
  flightNumber: string
}) {
  const target = new Date(nextDeparture)
  const [label, setLabel] = useState(() => calcCountdown(target))

  useEffect(() => {
    const id = setInterval(() => {
      const next = calcCountdown(target)
      setLabel(next)
      if (!next) clearInterval(id)
    }, 1_000)
    return () => clearInterval(id)
  }, [nextDeparture])

  if (!label) return null

  return (
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Next departure</p>
        <p className="text-white font-semibold text-sm mt-0.5">{flightNumber}</p>
      </div>
      <p className="text-blue-400 font-bold text-xl tabular-nums">{label}</p>
    </div>
  )
}
