import BottomNav from "@/components/BottomNav"

export default function JourneysLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-20 min-h-screen">{children}</main>
      <BottomNav />
    </>
  )
}
