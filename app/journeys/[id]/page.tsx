import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import FlightCard from "@/components/FlightCard"
import BreakCard from "@/components/BreakCard"
import JourneyCountdown from "@/components/JourneyCountdown"
import JourneyActions from "./JourneyActions"
import AddFlightForm from "./AddFlightForm"
import AddBreakForm from "./AddBreakForm"

export const dynamic = "force-dynamic"

const TERMINAL_STATUSES = new Set(["landed", "cancelled", "diverted"])

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

  // Next upcoming flight (not cancelled, not yet departed)
  const now = new Date()
  const nextFlight = journey.flights.find(
    (f) => !TERMINAL_STATUSES.has(f.status) && new Date(f.departureTime) > now
  )

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

  return (
    <div className="px-4 pt-6 pb-20">
      <JourneyActions journey={journey} shareUrl={shareUrl} />

      {nextFlight && (
        <JourneyCountdown
          nextDeparture={nextFlight.departureTime.toISOString()}
          flightNumber={nextFlight.flightNumber}
        />
      )}

      {timeline.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">No flights yet. Search and add one below.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {timeline.map((item) =>
            item.type === "flight" ? (
              <FlightCard key={item.data.id} flight={item.data} journeyId={journey.id} />
            ) : (
              <BreakCard key={item.data.id} stayBreak={item.data} journeyId={journey.id} />
            )
          )}
        </div>
      )}

      <div className="space-y-3">
        <AddFlightForm journeyId={journey.id} />
        <AddBreakForm journeyId={journey.id} />
      </div>
    </div>
  )
}
