"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CheckCircle2, Loader2, AlertCircle, FileText, Mic, Target, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalysisStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  icon: React.ComponentType<{ className?: string }>
  description: string
}

interface AnalysisProgressProps {
  isVisible: boolean
  onComplete: () => void
  type: 'resume' | 'speech' | 'training' | 'job'
  title: string
}

const getAnalysisSteps = (type: 'resume' | 'speech' | 'training' | 'job'): AnalysisStep[] => {
  switch (type) {
    case 'resume':
      return [
        {
          id: 'upload',
          name: 'Uploading Resume',
          status: 'pending',
          progress: 0,
          icon: FileText,
          description: 'Processing your resume file...'
        },
        {
          id: 'parse',
          name: 'Parsing Content',
          status: 'pending',
          progress: 0,
          icon: FileText,
          description: 'Extracting text and structure...'
        },
        {
          id: 'analyze',
          name: 'AI Analysis',
          status: 'pending',
          progress: 0,
          icon: Target,
          description: 'Analyzing content and keywords...'
        },
        {
          id: 'score',
          name: 'Generating Score',
          status: 'pending',
          progress: 0,
          icon: CheckCircle2,
          description: 'Calculating overall score...'
        }
      ]
    case 'speech':
      return [
        {
          id: 'record',
          name: 'Recording Audio',
          status: 'pending',
          progress: 0,
          icon: Mic,
          description: 'Capturing your speech...'
        },
        {
          id: 'transcribe',
          name: 'Transcribing',
          status: 'pending',
          progress: 0,
          icon: FileText,
          description: 'Converting speech to text...'
        },
        {
          id: 'analyze',
          name: 'Speech Analysis',
          status: 'pending',
          progress: 0,
          icon: Target,
          description: 'Analyzing speaking patterns...'
        },
        {
          id: 'metrics',
          name: 'Generating Metrics',
          status: 'pending',
          progress: 0,
          icon: CheckCircle2,
          description: 'Calculating performance metrics...'
        }
      ]
    case 'training':
      return [
        {
          id: 'setup',
          name: 'Setting Up Session',
          status: 'pending',
          progress: 0,
          icon: Target,
          description: 'Preparing training environment...'
        },
        {
          id: 'questions',
          name: 'Loading Questions',
          status: 'pending',
          progress: 0,
          icon: FileText,
          description: 'Selecting practice questions...'
        },
        {
          id: 'ready',
          name: 'Ready to Start',
          status: 'pending',
          progress: 0,
          icon: CheckCircle2,
          description: 'Training session prepared...'
        }
      ]
    case 'job':
      return [
        {
          id: 'input',
          name: 'Processing Input',
          status: 'pending',
          progress: 0,
          icon: Briefcase,
          description: 'Validating job information...'
        },
        {
          id: 'match',
          name: 'Matching Skills',
          status: 'pending',
          progress: 0,
          icon: Target,
          description: 'Analyzing skill requirements...'
        },
        {
          id: 'save',
          name: 'Saving Job',
          status: 'pending',
          progress: 0,
          icon: CheckCircle2,
          description: 'Adding to your job list...'
        }
      ]
    default:
      return []
  }
}

const getStepIcon = (step: AnalysisStep) => {
  const IconComponent = step.icon
  
  switch (step.status) {
    case 'completed':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"
        >
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </motion.div>
      )
    case 'processing':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Loader2 className="h-5 w-5 text-primary" />
        </motion.div>
      )
    case 'error':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center"
        >
          <AlertCircle className="h-5 w-5 text-red-600" />
        </motion.div>
      )
    default:
      return (
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        </div>
      )
  }
}

export default function AnalysisProgress({ isVisible, onComplete, type, title }: AnalysisProgressProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>(getAnalysisSteps(type))
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const simulateProgress = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Update current step to processing
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'processing' as const } : step
        ))
        setCurrentStepIndex(i)

        // Simulate step progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setSteps(prev => prev.map((step, index) => 
            index === i ? { ...step, progress } : step
          ))
          setOverallProgress(((i * 100) + progress) / steps.length)
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed' as const, progress: 100 } : step
        ))

        // Wait before next step
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // All steps completed
      setTimeout(() => {
        onComplete()
      }, 1000)
    }

    simulateProgress()
  }, [isVisible, onComplete, steps.length])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card className="minimal-card shadow-2xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {type === 'resume' && <FileText className="h-8 w-8 text-primary" />}
              {type === 'speech' && <Mic className="h-8 w-8 text-primary" />}
              {type === 'training' && <Target className="h-8 w-8 text-primary" />}
              {type === 'job' && <Briefcase className="h-8 w-8 text-primary" />}
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              {title}
            </CardTitle>
            <div className="text-muted-foreground">
              Please wait while we process your request...
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                    step.status === 'completed' 
                      ? 'border-green-200 bg-green-50' 
                      : step.status === 'processing'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {getStepIcon(step)}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${
                        step.status === 'completed' 
                          ? 'text-green-800' 
                          : step.status === 'processing'
                          ? 'text-primary'
                          : 'text-foreground'
                      }`}>
                        {step.name}
                      </h3>
                      {step.status === 'processing' && (
                        <span className="text-sm text-primary">
                          {step.progress}%
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    
                    {step.status === 'processing' && (
                      <Progress value={step.progress} className="h-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Completion Message */}
            {overallProgress === 100 && (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Analysis Complete!
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting you to the results...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
