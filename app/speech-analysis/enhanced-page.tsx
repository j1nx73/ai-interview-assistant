"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Download, 
  History, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Loader2, 
  Sparkles, 
  BarChart3, 
  Star,
  Zap,
  Clock,
  Volume2,
  Activity
} from "lucide-react"

// Mock data for demonstration
const mockQuestions = [
  {
    id: 1,
    text: "Tell me about a challenging project you worked on and how you overcame obstacles.",
    category: "behavioral",
    difficulty: "intermediate",
    tips: ["Use STAR method", "Focus on your role", "Quantify results"]
  },
  {
    id: 2,
    text: "What are your greatest strengths and how do they apply to this role?",
    category: "behavioral", 
    difficulty: "beginner",
    tips: ["Be specific", "Give examples", "Connect to job"]
  },
  {
    id: 3,
    text: "How do you handle working with difficult team members?",
    category: "behavioral",
    difficulty: "intermediate", 
    tips: ["Stay professional", "Focus on solutions", "Show empathy"]
  }
]

const mockAnalysis = {
  overallScore: 82,
  clarity: 85,
  pace: 78,
  confidence: 80,
  fillerWords: 3,
  speakingRate: 145,
  transcript: "Tell me about a challenging project you worked on... I think, um, it was when I was working at my previous company...",
  feedback: [
    "Good pace and clarity",
    "Consider reducing filler words like 'um' and 'I think'",
    "Strong project description",
    "Could add more specific metrics"
  ]
}

export default function SpeechAnalysisPage() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(mockQuestions[0])
  const [recordingTime, setRecordingTime] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        handleRecordingComplete(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      setRecordingInterval(interval)

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone.",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording Failed",
        description: "Please check your microphone permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingInterval) {
        clearInterval(recordingInterval)
        setRecordingInterval(null)
      }

      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Use mock analysis result
      setAnalysisResult(mockAnalysis)
      
      toast({
        title: "Analysis Complete",
        description: "Your speech has been analyzed successfully!",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const nextQuestion = () => {
    const currentIndex = mockQuestions.findIndex(q => q.id === currentQuestion.id)
    const nextIndex = (currentIndex + 1) % mockQuestions.length
    setCurrentQuestion(mockQuestions[nextIndex])
    setAnalysisResult(null)
    setRecordingTime(0)
  }

  const previousQuestion = () => {
    const currentIndex = mockQuestions.findIndex(q => q.id === currentQuestion.id)
    const prevIndex = currentIndex === 0 ? mockQuestions.length - 1 : currentIndex - 1
    setCurrentQuestion(mockQuestions[prevIndex])
    setAnalysisResult(null)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Speech Analysis</h1>
          <p className="text-muted-foreground">
            Record your interview responses and get AI-powered feedback on your speech patterns
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="recording" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recording">Recording</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Recording Tab */}
              <TabsContent value="recording" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Practice Interview Recording</CardTitle>
                    <CardDescription>Current Question: "{currentQuestion.text}"</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Recording Controls */}
                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative">
                        <div
                          className={`flex h-32 w-32 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                            isRecording
                              ? "border-destructive bg-destructive/10 animate-pulse shadow-lg shadow-destructive/20"
                              : "border-primary bg-primary/10 hover:bg-primary/15"
                          }`}
                        >
                          {isRecording ? (
                            <Mic className="h-12 w-12 text-destructive" />
                          ) : (
                            <MicOff className="h-12 w-12 text-primary" />
                          )}
                        </div>
                        {isRecording && (
                          <div className="absolute -top-2 -right-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive animate-pulse">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timer */}
                      <div className="flex items-center gap-2 text-2xl font-mono font-bold">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className={isRecording ? "text-destructive" : "text-foreground"}>
                          {formatTime(recordingTime)}
                        </span>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center gap-4">
                        {!isRecording ? (
                          <Button onClick={startRecording} size="lg" className="gap-2 min-w-[140px]">
                            <Mic className="h-5 w-5" />
                            Start Recording
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={stopRecording}
                              variant="outline"
                              size="lg"
                              className="gap-2 min-w-[120px] bg-transparent"
                            >
                              {isRecording ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                              {isRecording ? "Pause" : "Resume"}
                            </Button>
                            <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2 min-w-[100px]">
                              <Square className="h-5 w-5" />
                              Stop
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Analyze Button */}
                      {analysisResult && (
                        <div className="flex flex-col items-center gap-4 w-full">
                          <Separator className="w-full" />
                          <Button
                            onClick={nextQuestion}
                            disabled={isAnalyzing}
                            size="lg"
                            className="gap-2 min-w-[160px]"
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Lightbulb className="h-5 w-5" />
                                Next Question
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Transcript Display */}
                      {analysisResult && (
                        <div className="mt-6 w-full">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            Your Response
                          </h4>
                          <div className="p-4 rounded-lg bg-muted/50 border max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{analysisResult.transcript}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>Words: {analysisResult.transcript.split(/\s+/).filter((word: string) => word.length > 0).length}</span>
                            <span>Filler words: {analysisResult.fillerWords}</span>
                            <span>Rate: {analysisResult.speakingRate} WPM</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                {isAnalyzing && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <CardTitle className="font-serif">Analyzing Your Speech...</CardTitle>
                      </div>
                      <CardDescription>Our AI is processing your recording and generating insights</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-16 w-16 rounded-full mx-auto" />
                        <Loader2 className="h-4 w-32 mx-auto" />
                      </div>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-2">
                            <Loader2 className="h-4 w-20" />
                            <Loader2 className="h-2 w-full" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Analysis Results */}
                {analysisResult && !isAnalyzing && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-serif flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Analysis Results
                          </CardTitle>
                          <CardDescription>AI-powered feedback on your speech performance</CardDescription>
                        </div>
                        <Button onClick={() => {
                          const data = {
                            question: currentQuestion.text,
                            transcript: analysisResult.transcript,
                            analysis: analysisResult,
                            timestamp: new Date().toISOString(),
                          }
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `speech-analysis-${new Date().toISOString().split('T')[0]}.json`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }} variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Score */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">{analysisResult.overallScore}%</div>
                        <p className="text-muted-foreground">Overall Speech Score</p>
                      </div>

                      <Separator />

                      {/* Detailed Metrics */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Clarity</span>
                            <Badge variant="secondary">{analysisResult.clarity}%</Badge>
                          </div>
                          <Progress value={analysisResult.clarity} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Speaking Pace</span>
                            <Badge variant="secondary">{analysisResult.pace}%</Badge>
                          </div>
                          <Progress value={analysisResult.pace} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Confidence</span>
                            <Badge variant="secondary">{analysisResult.confidence}%</Badge>
                          </div>
                          <Progress value={analysisResult.confidence} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Filler Words</span>
                            <Badge variant="outline">{analysisResult.fillerWords} detected</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Lower is better</div>
                        </div>
                      </div>

                      <Separator />

                      {/* Suggestions */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Improvement Suggestions
                        </h4>
                        <div className="space-y-2">
                          {analysisResult.feedback.map((suggestion: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/50">
                              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Practice History
                    </CardTitle>
                    <CardDescription>Your recent speech analysis sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Mock history data */}
                    <div className="space-y-4">
                      {mockQuestions.map((question, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{question.text}</h4>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(recordingTime) / 60}:{(recordingTime % 60).toString().padStart(2, '0')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {analysisResult?.overallScore || 0}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {new Date().toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant={analysisResult?.overallScore >= 80 ? "default" : analysisResult?.overallScore >= 60 ? "secondary" : "destructive"}>
                            {analysisResult?.overallScore >= 80 ? "Excellent" : analysisResult?.overallScore >= 60 ? "Good" : "Needs Work"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Question Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Practice Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mockQuestions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3 bg-transparent"
                      onClick={() => setCurrentQuestion(question)}
                    >
                      {question.text}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Recording Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Volume2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at a moderate pace</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mic className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Keep your microphone 6-8 inches away</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Aim for 1-3 minute responses</span>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Practice eliminating filler words</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                {/* No progress tracking in mock data */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
