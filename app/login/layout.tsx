import type React from "react"
import { Toaster } from "@/components/ui/toaster"

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {children}
      <Toaster />
    </div>
  )
}
