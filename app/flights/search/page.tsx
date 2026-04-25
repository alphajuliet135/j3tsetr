import BottomNav from "@/components/BottomNav"

export default function FlightSearchPage() {
  return (
    <>
      <main className="px-4 pt-6 pb-20 min-h-screen">
        <h1 className="text-xl font-bold text-white mb-5">Search Flights</h1>

        <div className="rounded-2xl border border-amber-800/50 bg-amber-950/30 p-4 flex gap-3 items-start mb-6">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-amber-400 text-sm font-semibold">Work in progress</p>
            <p className="text-amber-500/80 text-xs mt-0.5">
              This page is not ready yet. Add flights from inside a journey using the search there.
            </p>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
