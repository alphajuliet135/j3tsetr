import BottomNav from "@/components/BottomNav"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SignOutButton from "./SignOutButton"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <>
      <main className="px-4 pt-6 pb-20 min-h-screen">
        <h1 className="text-xl font-bold text-white mb-5">Settings</h1>

        <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] divide-y divide-[#2C2C2E]">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm uppercase">
              {session?.user.name?.[0] ?? "?"}
            </div>
            <div>
              <p className="text-white font-medium">{session?.user.name}</p>
              <p className="text-gray-500 text-xs">Signed in</p>
            </div>
          </div>
          <div className="p-4">
            <SignOutButton />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-700 text-xs">j3tsetr</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5">
            {process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
