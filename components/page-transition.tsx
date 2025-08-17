"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Loading...")
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationStartTime = useRef<number>(0)

  useEffect(() => {
    const handleStart = () => {
      console.log('PageTransition: Navigation started')
      setIsNavigating(true)
      setIsLoading(true)
      navigationStartTime.current = Date.now()
      
      // Set loading message based on current pathname
      const pageType = pathname.split('/')[1] || 'home'
      const messages = {
        'dashboard': 'Loading Dashboard...',
        'chat-bot': 'Opening Chat...',
        'resume-analysis': 'Loading Resume Analysis...',
        'speech-analysis': 'Loading Speech Analysis...',
        'profile': 'Loading Profile...',
        'settings': 'Loading Settings...',
        'train': 'Loading Training...',
        'export': 'Loading Export...',
        'progress': 'Loading Progress...',
        'home': 'Loading...',
        'login': 'Loading Login...'
      }
      
      setLoadingText(messages[pageType as keyof typeof messages] || 'Loading...')
    }

    const handleComplete = () => {
      console.log('PageTransition: Navigation completed')
      const elapsed = Date.now() - navigationStartTime.current
      const minLoadingTime = 500 // Minimum loading time in ms
      
      if (elapsed < minLoadingTime) {
        // If navigation was too fast, show loading for minimum time
        setTimeout(() => {
          setIsLoading(false)
          setIsNavigating(false)
        }, minLoadingTime - elapsed)
      } else {
        setIsLoading(false)
        setIsNavigating(false)
      }
    }

    // Simulate navigation events since Next.js 13+ doesn't expose them directly
    // We'll use pathname changes as a proxy for navigation
    const handlePathnameChange = () => {
      if (isNavigating) {
        handleComplete()
      } else {
        handleStart()
      }
    }

    // Trigger navigation start when pathname changes
    if (pathname) {
      handlePathnameChange()
    }

    return () => {
      // Cleanup
    }
  }, [pathname, isNavigating])

  return (
    <>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center gap-6"
            >
              {/* Enhanced Loading Spinner */}
              <div className="relative">
                {/* Main spinning ring */}
                <motion.div
                  className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {/* Secondary counter-spinning ring */}
                <motion.div
                  className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary/30 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner pulsing circle */}
                <motion.div
                  className="absolute inset-2 w-16 h-16 bg-primary/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Center dot */}
                <motion.div
                  className="absolute inset-8 w-4 h-4 bg-primary rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              
              {/* Loading Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.p
                  className="text-lg font-semibold text-foreground mb-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {loadingText}
                </motion.p>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Please wait while we prepare your page...
                </motion.p>
              </motion.div>
              
              {/* Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-48 h-1 bg-primary/20 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Test Button - Remove this in production */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => {
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 2000)
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Test Loading
        </button>
      </div>
      
      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
