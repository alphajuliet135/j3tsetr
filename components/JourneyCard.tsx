import type { Journey } from "@prisma/client"
import Link from "next/link"

type JourneyWithCount = Journey & { _count: { flights: number } }

export default function JourneyCard({ journey }: { journey: JourneyWithCount }) {
  return (
    <Link href={`/journeys/${journey.id}`} className="block">
      <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] active:scale-[0.98] transition-transform">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-base truncate">{journey.name}</h2>
            {journey.description && (
              <p className="text-gray-500 text-sm mt-0.5 truncate">{journey.description}</p>
            )}
          </div>
          <svg
            className="w-5 h-5 text-gray-600 shrink-0 mt-0.5 ml-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <span className="text-gray-500 text-sm">
            {journey._count.flights === 0
              ? "No flights"
              : `${journey._count.flights} flight${journey._count.flights === 1 ? "" : "s"}`}
          </span>
          {journey.isShared && (
            <span className="text-xs font-medium text-green-400 bg-green-950 px-2 py-0.5 rounded-full">
              Shared
            </span>
          )}
          <span className="ml-auto text-gray-600 text-xs">
            {new Date(journey.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  )
}
