import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { createHmac } from "crypto"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import FlightCard from "@/components/FlightCard"
import BreakCard from "@/components/BreakCard"
import PasswordGate from "./PasswordGate"

type Props = { params: Promise<{ shareToken: string }> }

function fmtLayover(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function signToken(shareToken: string): string {
  return createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "dev-secret")
    .update(shareToken)
    .digest("hex")
}

export async function generateMetadata({ params }: Props) {
  const { shareToken } = await params
  const journey = await prisma.journey.findFirst({
    where: { shareToken, isShared: true },
    select: { name: true },
  })
  return { title: journey ? `${journey.name} — j3tsetr` : "Not found" }
}

export default async function PublicSharePage({ params }: Props) {
  const { shareToken } = await params

  const journey = await prisma.journey.findFirst({
    where: { shareToken, isShared: true },
    include: {
      flights: { orderBy: { departureTime: "asc" } },
      breaks: { orderBy: { startDate: "asc" } },
      user: { select: { username: true } },
    },
  })

  if (!journey) notFound()

  // Check password protection
  if (journey.sharePassword) {
    const jar = await cookies()
    const cookie = jar.get(`j3tsetr_unlock_${shareToken}`)
    const valid = cookie?.value === signToken(shareToken)
    if (!valid) {
      return <PasswordGate shareToken={shareToken} journeyName={journey.name} />
    }
  }

  // Interleave flights and breaks sorted by time
  type TimelineItem =
    | { type: "flight"; sortKey: number; data: (typeof journey.flights)[number] }
    | { type: "break"; sortKey: number; data: (typeof journey.breaks)[number] }

  const timeline: TimelineItem[] = [
    ...journey.flights.map((f) => ({
      type: "flight" as const,
      sortKey: new Date(f.departureTime).getTime(),
      data: f,
    })),
    ...journey.breaks.map((b) => ({
      type: "break" as const,
      sortKey: new Date(b.startDate).getTime(),
      data: b,
    })),
  ].sort((a, b) => a.sortKey - b.sortKey)

  const timelineElements: ReactNode[] = []
  let lastDate = ""
  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i]

    if (i > 0) {
      const prev = timeline[i - 1]
      if (prev.type === "flight" && item.type === "flight" && prev.data.destination === item.data.origin) {
        const layoverMs = new Date(item.data.departureTime).getTime() - new Date(prev.data.arrivalTime).getTime()
        if (layoverMs > 0 && layoverMs <= 12 * 3_600_000) {
          timelineElements.push(
            <div key={`layover-${i}`} className="flex items-center gap-2 px-1">
              <div className="flex-1 h-px bg-[#2C2C2E]" />
              <span className="text-gray-500 text-xs font-medium tracking-wide">
                Layover at {prev.data.destination} · {fmtLayover(layoverMs)}
              </span>
              <div className="flex-1 h-px bg-[#2C2C2E]" />
            </div>
          )
        }
      }
    }

    const dateStr = new Date(item.sortKey).toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    })
    if (dateStr !== lastDate) {
      lastDate = dateStr
      timelineElements.push(
        <p key={`date-${dateStr}`} className="text-gray-400 text-sm font-semibold pt-2 first:pt-0">
          {dateStr}
        </p>
      )
    }

    timelineElements.push(
      item.type === "flight" ? (
        <FlightCard key={item.data.id} flight={item.data} />
      ) : (
        <BreakCard key={item.data.id} stayBreak={item.data} journeyId={journey.id} readonly />
      )
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✈️</span>
            <span className="text-gray-500 text-sm">j3tsetr</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{journey.name}</h1>
          {journey.description && (
            <p className="text-gray-500 text-sm mt-1">{journey.description}</p>
          )}
          <p className="text-gray-600 text-xs mt-2">Shared by {journey.user.username}</p>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No flights in this journey yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timelineElements}
          </div>
        )}

        <p className="text-center text-gray-700 text-xs mt-10">
          Powered by{" "}
          <a href="https://github.com/alphajuliet135/j3tsetr" className="hover:text-gray-500 transition">
            j3tsetr
          </a>
        </p>
      </div>
    </div>
  )
}
