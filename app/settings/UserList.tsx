"use client"

import { useEffect, useState } from "react"

type User = { id: string; username: string; createdAt: string; _count: { journeys: number } }

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [username, setUsername] = useState(user.username)
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const body: Record<string, string> = {}
    if (username !== user.username) body.username = username
    if (newPassword) body.newPassword = newPassword

    if (!Object.keys(body).length) { setSaving(false); onClose(); return }

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setSaving(false)
    if (res.ok) { onSaved() } else {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1C1C1E] rounded-2xl p-5 border border-[#2C2C2E] shadow-xl">
        <h2 className="text-white font-semibold text-base mb-4">Edit {user.username}</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            minLength={3}
            maxLength={32}
            required
            className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (leave blank to keep)"
            minLength={8}
            className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 rounded-xl py-2.5 text-sm font-semibold transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteUserModal({ user, onClose, onDeleted }: { user: User; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
    onDeleted()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#1C1C1E] rounded-2xl p-5 border border-[#2C2C2E] shadow-xl">
        <h2 className="text-white font-semibold text-base mb-1">Delete user?</h2>
        <p className="text-gray-400 text-sm mb-5">
          <span className="text-white font-medium">{user.username}</span> and all their journeys will be permanently deleted.
        </p>
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50">
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button onClick={onClose} disabled={deleting} className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-gray-300 rounded-xl py-2.5 text-sm font-semibold transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserList({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)

  async function fetchUsers() {
    const res = await fetch("/api/admin/users")
    if (res.ok) setUsers(await res.json())
  }

  useEffect(() => { fetchUsers() }, [])

  return (
    <div>
      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchUsers() }}
        />
      )}
      {deleting && (
        <DeleteUserModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => { setDeleting(null); fetchUsers() }}
        />
      )}

      <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] divide-y divide-[#2C2C2E]">
        {users.map((u) => {
          const isSelf = u.id === currentUserId
          return (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-gray-300 text-xs font-semibold uppercase shrink-0">
                {u.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {u.username}
                  {isSelf && <span className="ml-1.5 text-[10px] text-blue-400 font-normal">you</span>}
                </p>
                <p className="text-gray-600 text-xs">
                  {u._count.journeys} {u._count.journeys === 1 ? "journey" : "journeys"} · joined{" "}
                  {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditing(u)}
                  className="p-1.5 text-gray-600 hover:text-gray-300 transition"
                  aria-label="Edit user"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => !isSelf && setDeleting(u)}
                  disabled={isSelf}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={isSelf ? "Cannot delete your own account" : "Delete user"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
