import type { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import FlightCard from "@/components/FlightCard"
import BreakCard from "@/components/BreakCard"
import JourneyActions from "./JourneyActions"
import AddFlightForm from "./AddFlightForm"
import AddBreakForm from "./AddBreakForm"

export const dynamic = "force-dynamic"

const TERMINAL_STATUSES = new Set(["landed", "cancelled", "diverted"])

function fmtLayover(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

type Props = { params: Promise<{ id: string }> }

export default async function JourneyDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const journey = await prisma.journey.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      flights: { orderBy: { departureTime: "asc" } },
      breaks: { orderBy: { startDate: "asc" } },
    },
  })

  if (!journey) notFound()

  // Auto-delete when all flights have reached a terminal state
  if (
    journey.autoDelete &&
    journey.flights.length > 0 &&
    journey.flights.every((f) => TERMINAL_STATUSES.has(f.status))
  ) {
    await prisma.journey.delete({ where: { id } })
    redirect("/journeys")
  }

  const shareUrl = `${process.env.NEXTAUTH_URL ?? ""}/j/${journey.shareToken}`

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

  // Build rendered timeline with date headers and layover badges
  const timelineElements: ReactNode[] = []
  let lastDate = ""
  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i]

    // Layover badge first (sits between the two flight cards)
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

    // Date header (above the first item of each new day)
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
        <FlightCard key={item.data.id} flight={item.data} journeyId={journey.id} />
      ) : (
        <BreakCard key={item.data.id} stayBreak={item.data} journeyId={journey.id} />
      )
    )
  }

  return (
    <div className="px-4 pt-6 pb-20">
      <JourneyActions journey={journey} shareUrl={shareUrl} />

      {timeline.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">No flights yet. Search and add one below.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {timelineElements}
        </div>
      )}

      <div className="space-y-3">
        <AddFlightForm journeyId={journey.id} />
        <AddBreakForm journeyId={journey.id} />
      </div>
    </div>
  )
}
