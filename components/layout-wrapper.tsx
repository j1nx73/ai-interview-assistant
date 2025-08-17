"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./sidebar"
import PageTransition from "./page-transition"
import { motion } from "framer-motion"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname?.startsWith("/login")

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {!isLoginPage && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Sidebar />
        </motion.div>
      )}
      <main className={`${isLoginPage ? "w-full" : "flex-1"} overflow-auto relative`}>
        <PageTransition>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </PageTransition>
      </main>
    </div>
  )
}
