"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./sidebar"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname?.startsWith("/login")

  return (
    <div className="flex h-screen bg-gray-50">
      {!isLoginPage && <Sidebar />}
      <main className={`${isLoginPage ? "w-full" : "flex-1"} overflow-auto`}>
        {children}
      </main>
    </div>
  )
}
