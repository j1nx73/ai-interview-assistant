"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Loading...")

  useEffect(() => {
    setIsLoading(true)
    
    // Set different loading messages for different page types
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
    
    // Show loading for longer to give better user feedback
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1]
        }}
        className="min-h-full"
      >
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
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
                transition={{ delay: 0.3 }}
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
                  transition={{ delay: 0.5 }}
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
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
