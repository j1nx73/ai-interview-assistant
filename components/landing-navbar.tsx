"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Menu, 
  X, 
  Sparkles, 
  Target, 
  Mic, 
  FileText, 
  MessageSquare,
  Zap
} from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
]

const features = [
  {
    name: "Speech Analysis",
    description: "Practice with real-time feedback",
    icon: Mic,
    href: "/speech-analysis"
  },
  {
    name: "Resume Review", 
    description: "AI-powered optimization",
    icon: FileText,
    href: "/resume-analysis"
  },
  {
    name: "AI Chat",
    description: "24/7 career coaching",
    icon: MessageSquare,
    href: "/chat-bot"
  },
  {
    name: "Training",
    description: "Skill building exercises",
    icon: Target,
    href: "/train"
  }
]

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <nav className="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">AI Interview Assistant</span>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AI Interview</span>
            </motion.div>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
            <Link href="/speech-analysis">
              <Button className="gap-2">
                <Zap className="h-4 w-4" />
                Try Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <motion.div
        className={`lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, y: mobileMenuOpen ? 0 : -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="fixed inset-0 z-50" />
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border/40">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">AI Interview Assistant</span>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AI Interview</span>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border/40">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="py-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground">Features</h3>
                  {features.map((feature) => (
                    <Link
                      key={feature.name}
                      href={feature.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <feature.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 space-y-3">
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Target className="h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/speech-analysis" className="block">
                    <Button className="w-full gap-2">
                      <Zap className="h-4 w-4" />
                      Try Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  )
}
