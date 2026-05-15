import type { Metadata, Viewport } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Providers from "@/components/SessionProvider"
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister"
import "./globals.css"

export const metadata: Metadata = {
  title: "j3tsetr",
  description: "Self-hosted flight tracker",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "j3tsetr",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111111",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-[#111111] text-white min-h-screen" suppressHydrationWarning>
        <Providers session={session}>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  )
}
