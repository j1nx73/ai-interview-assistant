"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${className}`}
    >
      <Loader2 className="w-full h-full text-primary" />
    </motion.div>
  )
}

interface PageLoadingSpinnerProps {
  message?: string
  showProgress?: boolean
}

export function PageLoadingSpinner({ message = "Loading...", showProgress = true }: PageLoadingSpinnerProps) {
  return (
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
            {message}
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
        {showProgress && (
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
        )}
      </motion.div>
    </motion.div>
  )
}

export function DotsLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  )
}
