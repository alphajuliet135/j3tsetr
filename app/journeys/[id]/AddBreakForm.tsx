"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddBreakForm({ journeyId }: { journeyId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const res = await fetch(`/api/journeys/${journeyId}/breaks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setSaving(false)
    if (res.ok) {
      setOpen(false)
      setForm({ title: "", location: "", startDate: "", endDate: "", notes: "" })
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? "Failed to save")
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#1C1C1E] border border-dashed border-[#3A3A3C] rounded-2xl py-4 text-gray-500 hover:text-gray-300 hover:border-gray-500 active:bg-[#2C2C2E] transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">Add Stay / Break</span>
      </button>
    )
  }

  return (
    <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Add Stay / Break</h3>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title (e.g. 3 nights in Paris)"
          value={form.title}
          onChange={set("title")}
          required
          className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
        />
        <input
          type="text"
          placeholder="Location (optional)"
          value={form.location}
          onChange={set("location")}
          className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-gray-500 text-xs mb-1 block">Arrival</label>
            <input
              type="date"
              value={form.startDate}
              onChange={set("startDate")}
              required
              className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-500 text-xs mb-1 block">Departure</label>
            <input
              type="date"
              value={form.endDate}
              onChange={set("endDate")}
              required
              className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
            />
          </div>
        </div>
        <textarea
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={set("notes")}
          rows={2}
          className="w-full bg-[#111111] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition resize-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50"
        >
          {saving ? "Saving…" : "Add Break"}
        </button>
      </form>
    </div>
  )
}
