"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Mic,
  FileText,
  MessageCircle,
  TrendingUp,
  Settings,
  Download,
  Target,
  Sparkles,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview & analytics" },
  { name: "Speech Analysis", href: "/speech-analysis", icon: Mic, description: "Practice & feedback" },
  { name: "Resume Analysis", href: "/resume-analysis", icon: FileText, description: "Optimize your CV" },
  { name: "Train", href: "/train", icon: Target, description: "Skill building" },
  { name: "Chat Bot", href: "/chat-bot", icon: MessageCircle, description: "AI assistance" },
]

const bottomNavigation = [
  { name: "Export Data", href: "/export", icon: Download, description: "Download reports" },
  { name: "Settings", href: "/settings", icon: Settings, description: "Preferences" },
]

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.div 
      className="flex h-screen w-72 flex-col bg-sidebar border-r border-sidebar-border minimal-shadow"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Logo */}
      <motion.div 
        className="flex h-20 items-center px-6 border-b border-sidebar-border"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center minimal-shadow"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div>
            <span className="text-xl font-semibold text-sidebar-foreground">AI Interview</span>
            <span className="block text-xs text-muted-foreground font-medium">Assistant</span>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div key={item.name} variants={itemVariants}>
              <Link
                href={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground minimal-shadow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon />
                </motion.div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs opacity-75 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-2">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <motion.div key={item.name} variants={itemVariants}>
              <Link
                href={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon />
                </motion.div>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs opacity-75 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
