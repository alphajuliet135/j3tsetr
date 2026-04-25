"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    href: "/journeys",
    label: "Journeys",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l1.5 5 1.5-2.5 1.5 2.5L15 10" />
      </svg>
    ),
  },
  {
    href: "/flights/search",
    label: "Search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-[#2C2C2E] pb-safe">
      <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/journeys"
              ? pathname === "/journeys" || pathname.startsWith("/journeys/")
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 min-w-[64px] py-1 transition-colors ${
                active ? "text-blue-400" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
