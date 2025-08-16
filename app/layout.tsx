import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import LayoutWrapper from "../components/layout-wrapper"
import { AuthProvider } from "@/lib/auth-context"

export const metadata: Metadata = {
  title: "AI Interview Assistant - Ace Your Next Interview",
  description:
    "AI-powered interview preparation with speech analysis, skill assessment, and personalized learning paths",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
