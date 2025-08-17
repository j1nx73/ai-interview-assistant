"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Brain,
  Volume2,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  BarChart3,
  Target,
  Zap,
  BookOpen,
  History,
  Award,
  Calendar,
  Star,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function EnhancedSpeechAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userProgress, setUserProgress] = useState({ sessions: 0, averageScore: 0 })
  const [currentQuestion, setCurrentQuestion] = useState("Tell me about yourself")
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("behavioral")
  const [showHistory, setShowHistory] = useState(false)
  const [speechHistory, setSpeechHistory] = useState([])
  const [wordCount, setWordCount] = useState(0)
  const [fillerWordCount, setFillerWordCount] = useState(0)
  const [speakingRate, setSpeakingRate] = useState(0)

  const intervalRef = useRef(null)
  const recognitionRef = useRef(null)
  const supabase = createClient()

  // Question bank organized by category
  const questionBank = {
    behavioral: [
      "Tell me about yourself",
      "Why do you want this job?",
      "What are your greatest strengths?",
      "What are your greatest weaknesses?",
      "Describe a challenge you overcame",
      "Tell me about a time you failed",
      "How do you handle stress?",
      "Describe your ideal work environment",
      "Where do you see yourself in 5 years?",
      "Why should we hire you?",
    ],
    technical: [
      "Explain a complex technical concept",
      "How do you stay updated with technology?",
      "Describe a technical problem you solved",
      "What's your experience with [specific technology]?",
      "How do you approach debugging?",
      "Explain your development process",
      "What tools do you use for development?",
      "How do you ensure code quality?",
      "Describe a project you're proud of",
      "How do you handle technical disagreements?",
    ],
    situational: [
      "How would you handle a difficult coworker?",
      "What would you do if you disagreed with your manager?",
      "How do you prioritize multiple deadlines?",
      "Describe a time you had to learn quickly",
      "How do you handle feedback?",
      "What would you do if you made a mistake?",
      "How do you approach new challenges?",
      "Describe a time you had to adapt",
      "How do you handle ambiguity?",
      "What motivates you?",
    ],
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }
  }, [])

  useEffect(() => {
    loadUserProgress()
    loadSpeechHistory()
  }, [])

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRecording, isPaused])

  const loadUserProgress = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: records, error } = await supabase.from("speech_records").select("score").eq("user_id", user.id)

      if (error) {
        console.error("Error loading progress:", error)
        return
      }

      const sessions = records?.length || 0
      const averageScore =
        sessions > 0 ? Math.round(records.reduce((sum, record) => sum + (record.score || 0), 0) / sessions) : 0

      setUserProgress({ sessions, averageScore })
    } catch (error) {
      console.error("Error loading progress:", error)
    }
  }

  const loadSpeechHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: records, error } = await supabase
        .from("speech_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error loading speech history:", error)
        return
      }

      setSpeechHistory(records || [])
    } catch (error) {
      console.error("Error loading speech history:", error)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    setRecordingTime(0)
    setAnalysisResults(null)
    setTranscript("")
    setWordCount(0)
    setFillerWordCount(0)
    setSpeakingRate(0)

    // Start speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }

  const pauseRecording = () => {
    setIsPaused(!isPaused)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    setHasRecording(true)
    clearInterval(intervalRef.current)

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
      }
    }

    // Calculate metrics
    const words = transcript.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length
    const fillerWords = words.filter(word => 
      ['um', 'uh', 'ah', 'er', 'like', 'you know', 'basically', 'actually', 'literally'].includes(word.toLowerCase())
    ).length
    const speakingRate = recordingTime > 0 ? Math.round((wordCount / recordingTime) * 60) : 0

    setWordCount(wordCount)
    setFillerWordCount(fillerWords)
    setSpeakingRate(speakingRate)
  }

  const analyzeRecording = async () => {
    setIsAnalyzing(true)

    try {
      // Simulate API call for analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Calculate scores based on real metrics
      const clarityScore = Math.max(0, 100 - (fillerWordCount * 8))
      const paceScore = speakingRate > 0 ? Math.min(100, Math.max(0, 100 - Math.abs(speakingRate - 150) / 2)) : 75
      const confidenceScore = wordCount > 20 ? 90 : Math.max(60, wordCount * 2)
      
      const overallScore = Math.round((clarityScore + paceScore + confidenceScore) / 3)

      const results = {
        overallScore,
        clarity: clarityScore,
        pace: paceScore,
        fillerWords: fillerWordCount,
        confidence: confidenceScore,
        wordCount,
        speakingRate,
        duration: recordingTime,
        suggestions: generateSuggestions(clarityScore, paceScore, confidenceScore, fillerWordCount, speakingRate),
      }

      setAnalysisResults(results)

      // Save speech record to database
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from("speech_records").insert({
          user_id: user.id,
          question: currentQuestion,
          transcript: transcript,
          analysis: results,
          feedback: results.suggestions.join(". "),
          score: results.overallScore,
          duration: recordingTime,
        })

        if (error) {
          console.error("Error saving speech record:", error)
        } else {
          // Reload progress after saving
          loadUserProgress()
          loadSpeechHistory()
        }
      }
    } catch (error) {
      console.error("Error analyzing recording:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateSuggestions = (clarity, pace, confidence, fillerWords, speakingRate) => {
    const suggestions = []
    
    if (clarity < 80) {
      suggestions.push("Try to reduce filler words like 'um' and 'uh'")
    }
    if (pace < 70) {
      if (speakingRate > 200) {
        suggestions.push("Slow down your speaking pace for better clarity")
      } else if (speakingRate < 100) {
        suggestions.push("Try to speak a bit faster to maintain engagement")
      }
    }
    if (confidence < 80) {
      suggestions.push("Practice expanding your responses with more detail")
    }
    if (fillerWords > 5) {
      suggestions.push("Work on eliminating filler words through practice")
    }
    if (suggestions.length === 0) {
      suggestions.push("Excellent speech! Keep practicing to maintain these skills")
    }
    
    return suggestions
  }

  const exportResults = () => {
    if (!analysisResults) return
    
    const data = {
      question: currentQuestion,
      transcript: transcript,
      analysis: analysisResults,
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
                    <CardDescription>Current Question: "{currentQuestion}"</CardDescription>
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
                              onClick={pauseRecording}
                              variant="outline"
                              size="lg"
                              className="gap-2 min-w-[120px] bg-transparent"
                            >
                              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                              {isPaused ? "Resume" : "Pause"}
                            </Button>
                            <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2 min-w-[100px]">
                              <Square className="h-5 w-5" />
                              Stop
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Analyze Button */}
                      {hasRecording && !isRecording && (
                        <div className="flex flex-col items-center gap-4 w-full">
                          <Separator className="w-full" />
                          <Button
                            onClick={analyzeRecording}
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
                                <Brain className="h-5 w-5" />
                                Analyze Recording
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Transcript Display */}
                      {transcript && (
                        <div className="mt-6 w-full">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Your Response
                          </h4>
                          <div className="p-4 rounded-lg bg-muted/50 border max-h-40 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>Words: {wordCount}</span>
                            <span>Filler words: {fillerWordCount}</span>
                            <span>Rate: {speakingRate} WPM</span>
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
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                      </div>
                      <Separator />
                      <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-2 w-full" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Analysis Results */}
                {analysisResults && !isAnalyzing && (
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
                        <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Score */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">{analysisResults.overallScore}%</div>
                        <p className="text-muted-foreground">Overall Speech Score</p>
                      </div>

                      <Separator />

                      {/* Detailed Metrics */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Clarity</span>
                            <Badge variant="secondary">{analysisResults.clarity}%</Badge>
                          </div>
                          <Progress value={analysisResults.clarity} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Speaking Pace</span>
                            <Badge variant="secondary">{analysisResults.pace}%</Badge>
                          </div>
                          <Progress value={analysisResults.pace} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Confidence</span>
                            <Badge variant="secondary">{analysisResults.confidence}%</Badge>
                          </div>
                          <Progress value={analysisResults.confidence} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Filler Words</span>
                            <Badge variant="outline">{analysisResults.fillerWords} detected</Badge>
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
                          {analysisResults.suggestions.map((suggestion, index) => (
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
                    {speechHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No practice sessions yet. Start recording to see your history!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {speechHistory.map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{record.question}</h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {Math.floor(record.duration / 60)}:{(record.duration % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {record.score}%
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(record.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Badge variant={record.score >= 80 ? "default" : record.score >= 60 ? "secondary" : "destructive"}>
                              {record.score >= 80 ? "Excellent" : record.score >= 60 ? "Good" : "Needs Work"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="situational">Situational</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questionBank[selectedCategory]?.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3 bg-transparent"
                      onClick={() => setCurrentQuestion(question)}
                    >
                      {question}
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
                  <div className="text-2xl font-bold text-primary">{userProgress.sessions}</div>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span className="font-medium">{userProgress.averageScore}%</span>
                  </div>
                  <Progress value={userProgress.averageScore} className="h-2" />
                </div>
                {userProgress.sessions > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Trend</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Improving
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
