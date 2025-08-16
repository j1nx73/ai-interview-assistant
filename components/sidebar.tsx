"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Mic,
  FileText,
  MessageCircle,
  TrendingUp,
  Settings,
  User,
  LogOut,
  Download,
  Target,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Speech Analysis", href: "/speech-analysis", icon: Mic },
  { name: "Resume Analysis", href: "/resume-analysis", icon: FileText },
  { name: "Train", href: "/train", icon: Target },
  { name: "Chat Bot", href: "/chat-bot", icon: MessageCircle },
]

const bottomNavigation = [
  { name: "Profile Settings", href: "/profile", icon: User },
  { name: "Export Data", href: "/export", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Rewind AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
              {item.name}
            </Link>
          )
        })}

        {/* User Profile */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Premium User</p>
            </div>
          </div>
          <button className="mt-2 flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors w-full">
            <LogOut className="mr-3 h-4 w-4 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
