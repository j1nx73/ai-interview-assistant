"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CompletionAlertProps {
  isVisible: boolean
  onClose: () => void
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  details?: string
  actionLabel?: string
  onAction?: () => void
}

const alertVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: -50,
    rotateX: -90
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -50,
    rotateX: -90,
    transition: {
      duration: 0.2
    }
  }
}

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      delay: 0.1
    }
  }
}

const progressVariants = {
  hidden: { width: 0 },
  visible: { 
    width: "100%",
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
}

const getAlertStyles = (type: 'success' | 'error' | 'info') => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle2,
        iconColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        progressColor: "bg-green-500"
      }
    case 'error':
      return {
        icon: AlertCircle,
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        progressColor: "bg-red-500"
      }
    case 'info':
      return {
        icon: Info,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        progressColor: "bg-blue-500"
      }
  }
}

export default function CompletionAlert({
  isVisible,
  onClose,
  type,
  title,
  message,
  details,
  actionLabel,
  onAction
}: CompletionAlertProps) {
  const styles = getAlertStyles(type)
  const IconComponent = styles.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md"
          variants={alertVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Card className={`minimal-card border-2 ${styles.borderColor} ${styles.bgColor} shadow-2xl`}>
            <CardContent className="p-6">
              {/* Progress Bar */}
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-t-lg"
                variants={progressVariants}
                initial="hidden"
                animate="visible"
              />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    className={`p-2 rounded-full bg-white shadow-md ${styles.iconColor}`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="font-semibold text-foreground text-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {title}
                    </motion.h3>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Message */}
              <motion.p 
                className="text-muted-foreground mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>

              {/* Details */}
              {details && (
                <motion.div 
                  className="mb-4 p-3 bg-white/50 rounded-lg border border-white/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-sm text-muted-foreground font-mono">{details}</p>
                </motion.div>
              )}

              {/* Action Button */}
              {actionLabel && onAction && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    onClick={onAction}
                    className="w-full minimal-shadow hover:minimal-shadow-hover"
                  >
                    {actionLabel}
                  </Button>
                </motion.div>
              )}

              {/* Auto-close indicator */}
              <motion.div 
                className="mt-4 h-1 bg-muted rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className={`h-full ${styles.progressColor}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => {
                    setTimeout(onClose, 500)
                  }}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Specialized completion alerts for different processes
export function ResumeAnalysisComplete({ isVisible, onClose, score, insights }: {
  isVisible: boolean
  onClose: () => void
  score: number
  insights: string[]
}) {
  return (
    <CompletionAlert
      isVisible={isVisible}
      onClose={onClose}
      type="success"
      title="Resume Analysis Complete!"
      message={`Your resume scored ${score}/100. Here are the key insights:`}
      details={insights.join('\n• ')}
      actionLabel="View Full Report"
      onAction={() => console.log('View full report')}
    />
  )
}

export function SpeechAnalysisComplete({ isVisible, onClose, confidence, wpm, fillerWords }: {
  isVisible: boolean
  onClose: () => void
  confidence: number
  wpm: number
  fillerWords: number
}) {
  return (
    <CompletionAlert
      isVisible={isVisible}
      onClose={onClose}
      type="success"
      title="Speech Analysis Complete!"
      message="Your speech has been analyzed successfully. Here's your performance summary:"
      details={`Confidence: ${confidence}%\nSpeaking Rate: ${wpm} WPM\nFiller Words: ${fillerWords}`}
      actionLabel="Review Transcript"
      onAction={() => console.log('Review transcript')}
    />
  )
}

export function TrainingComplete({ isVisible, onClose, questionsAnswered, accuracy }: {
  isVisible: boolean
  onClose: () => void
  questionsAnswered: number
  accuracy: number
}) {
  return (
    <CompletionAlert
      isVisible={isVisible}
      onClose={onClose}
      type="success"
      title="Training Session Complete!"
      message={`Great job! You've completed ${questionsAnswered} questions with ${accuracy}% accuracy.`}
      details="Keep practicing to improve your interview skills further."
      actionLabel="View Progress"
      onAction={() => console.log('View progress')}
    />
  )
}

export function JobAddedComplete({ isVisible, onClose, jobTitle, company }: {
  isVisible: boolean
  onClose: () => void
  jobTitle: string
  company: string
}) {
  return (
    <CompletionAlert
      isVisible={isVisible}
      onClose={onClose}
      type="success"
      title="Job Added Successfully!"
      message={`The position at ${company} has been added to your job tracking.`}
      details={`Job Title: ${jobTitle}\nCompany: ${company}\nStatus: Active`}
      actionLabel="View Job Details"
      onAction={() => console.log('View job details')}
    />
  )
}
