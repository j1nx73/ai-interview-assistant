"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  FileText, 
  FileAudio, 
  CheckCircle2, 
  Loader2,
  Sparkles
} from "lucide-react"

interface AnalysisProgressProps {
  type: "resume" | "speech" | "general"
  progress: number
  status: "analyzing" | "processing" | "complete" | "error"
  message?: string
  className?: string
}

export function AnalysisProgress({ 
  type, 
  progress, 
  status, 
  message, 
  className = "" 
}: AnalysisProgressProps) {
  const getIcon = () => {
    switch (type) {
      case "resume":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "speech":
        return <FileAudio className="h-5 w-5 text-green-500" />
      default:
        return <BarChart3 className="h-5 w-5 text-purple-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "complete":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "analyzing":
        return "text-blue-600"
      default:
        return "text-purple-600"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "error":
        return <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
      case "analyzing":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Sparkles className="h-5 w-5 text-purple-600" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-3 rounded-full bg-muted/50"
            >
              {getIcon()}
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {type === "resume" ? "Resume Analysis" : 
                   type === "speech" ? "Speech Analysis" : "Analysis"}
                </h3>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {getStatusIcon()}
                </motion.div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={getStatusColor()}>
                  {status === "complete" ? "Analysis Complete" :
                   status === "error" ? "Analysis Failed" :
                   status === "analyzing" ? "Analyzing Content" : "Processing..."}
                </span>
                {message && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground"
                  >
                    • {message}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >
              <Progress 
                value={progress} 
                className="h-2 transition-all duration-300"
              />
            </motion.div>

            {status === "analyzing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span>Processing your content...</span>
              </motion.div>
            )}

            {status === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-sm text-green-600 font-medium"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Analysis completed successfully!</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Enhanced progress bar with steps
interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className = "" }: StepProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground"
        >
          {steps[currentStep - 1] || "Starting analysis..."}
        </motion.p>
      </div>
    </motion.div>
  )
}
