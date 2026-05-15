"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import dynamic from "next/dynamic"
import BottomNav from "@/components/BottomNav"
import EditProfileModal from "./EditProfileModal"

const UserList = dynamic(() => import("./UserList"), { ssr: false })
const RegistrationToggle = dynamic(() => import("./RegistrationToggle"), { ssr: false })

export default function SettingsPage() {
  const { data: session } = useSession()
  const [editingProfile, setEditingProfile] = useState(false)

  const username = session?.user.name ?? ""
  const userId = session?.user.id ?? ""

  return (
    <>
      <main className="px-4 pt-6 pb-20 min-h-screen">
        <h1 className="text-xl font-bold text-white mb-5">Settings</h1>

        {/* My Account */}
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">My Account</p>
        <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] divide-y divide-[#2C2C2E] mb-6">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm uppercase shrink-0">
              {username[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{username}</p>
              <p className="text-gray-500 text-xs">Signed in</p>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="p-1.5 text-gray-600 hover:text-gray-300 transition shrink-0"
              aria-label="Edit profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div className="px-4 py-3">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Users */}
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">Users</p>
        <div className="mb-6">
          {userId && <UserList currentUserId={userId} />}
        </div>

        {/* App Settings */}
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">App Settings</p>
        <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] mb-8">
          <RegistrationToggle />
        </div>

        <div className="text-center">
          <p className="text-gray-700 text-xs">j3tsetr</p>
          <p className="text-gray-600 text-xs font-mono mt-0.5">
            {process.env.NEXT_PUBLIC_APP_VERSION ?? "dev"}
          </p>
        </div>
      </main>

      {editingProfile && username && (
        <EditProfileModal currentUsername={username} onClose={() => setEditingProfile(false)} />
      )}

      <BottomNav />
    </>
  )
}
