"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Mic, 
  Menu, 
  X, 
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  UserPlus,
  LogIn
} from "lucide-react"
import Link from "next/link"

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const navItems = [
    {
      label: "Info",
      href: "#info",
      icon: Info,
      description: "Learn about our platform"
    },
    {
      label: "Problem",
      href: "#problem", 
      icon: AlertTriangle,
      description: "The challenges we solve"
    },
    {
      label: "Solution",
      href: "#solution",
      icon: Lightbulb,
      description: "How we help you succeed"
    },
    {
      label: "Feedbacks",
      href: "#feedbacks",
      icon: MessageSquare,
      description: "What users say about us"
    }
  ]

  const toggleDropdown = (item: string) => {
    setActiveDropdown(activeDropdown === item ? null : item)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
            >
              <Mic className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl font-bold text-foreground"
            >
              AI Interview Assistant
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown */}
                {activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Learn More →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-2 transition-all duration-200 hover:bg-muted/50">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/login">
                <Button size="sm" className="gap-2 transition-all duration-200 hover:shadow-md">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 transition-all duration-200"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 py-4"
          >
            <div className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <Link href="/login" className="block">
                  <Button variant="ghost" size="sm" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Log In
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button size="sm" className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
