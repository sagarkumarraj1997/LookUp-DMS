import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "LookUp DMS",
    template: "%s | LookUp DMS",
  },
  description: "Enterprise Document Management System — Secure, Smart, Scalable",
  keywords: ["document management", "DMS", "enterprise", "cloud storage", "collaboration"],
  authors: [{ name: "LookUp DMS" }],
  creator: "LookUp DMS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "LookUp DMS",
    description: "Enterprise Document Management System",
    siteName: "LookUp DMS",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
