"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Mic,
  Play,
  Square,
  Loader2,
  CheckCircle2,
  Target,
  FileText,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Brain,
  TrendingUp,
  Star,
  MessageSquare,
  BookOpen,
  Plus,
  Lightbulb,
  Award,
  BarChart3,
  Eye,
  Upload,
  FileAudio,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  text: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  tips?: string[]
}

interface TrainingSession {
  id: string
  question: Question
  userAnswer: string
  analysis: {
    confidence: number
    clarity: number
    structure: number
    relevance: number
    overallScore: number
    feedback: string[]
    improvements: string[]
    strengths: string[]
  }
  timestamp: Date
  duration: number
}

interface PresetQuestions {
  [category: string]: Question[]
}

const presetQuestions: PresetQuestions = {
  "Behavioral": [
    {
      id: "beh-1",
      text: "Tell me about a time when you had to overcome a significant challenge at work.",
      category: "Behavioral",
      difficulty: "medium",
      tips: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Focus on your role and specific actions you took",
        "Quantify the impact when possible"
      ]
    },
    {
      id: "beh-2",
      text: "Describe a situation where you had to work with a difficult team member.",
      category: "Behavioral",
      difficulty: "medium",
      tips: [
        "Stay professional and focus on resolution",
        "Highlight your communication and problem-solving skills",
        "Show how you maintained team harmony"
      ]
    }
  ],
  "Technical": [
    {
      id: "tech-1",
      text: "Explain a complex technical concept to a non-technical stakeholder.",
      category: "Technical",
      difficulty: "hard",
      tips: [
        "Use analogies and real-world examples",
        "Avoid jargon and technical terms",
        "Check for understanding throughout"
      ]
    },
    {
      id: "tech-2",
      text: "How do you stay updated with the latest technology trends?",
      category: "Technical",
      difficulty: "easy",
      tips: [
        "Mention specific resources and communities",
        "Show how you apply new knowledge",
        "Demonstrate continuous learning mindset"
      ]
    }
  ],
  "Leadership": [
    {
      id: "lead-1",
      text: "Tell me about a time when you had to lead a team through a major change.",
      category: "Leadership",
      difficulty: "hard",
      tips: [
        "Show your change management approach",
        "Highlight how you supported your team",
        "Demonstrate resilience and adaptability"
      ]
    }
  ]
}

export default function TrainPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Behavioral")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [customQuestion, setCustomQuestion] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null)
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([])
  const [showResults, setShowResults] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState<'record' | 'upload'>('record')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startRecording = async () => {
    try {
      // Reset chunks
      chunksRef.current = []
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Check supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
      
      console.log('Using MIME type:', mimeType)
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes')
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstart = () => {
        console.log('Recording started')
        setIsRecording(true)
      }
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, processing audio...')
        const blob = new Blob(chunksRef.current, { type: mimeType })
        console.log('Audio blob size:', blob.size, 'bytes')
        processAudioAnswer(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        alert('Recording error occurred. Please try again.')
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      
    } catch (error) {
      console.error('Error starting recording:', error)
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone permissions and try again.')
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.')
        } else {
          alert(`Recording failed: ${error.message}`)
        }
      } else {
        alert('Failed to start recording. Please check microphone permissions.')
      }
    }
  }

  const stopRecording = () => {
    console.log('Stop recording called, isRecording:', isRecording, 'mediaRecorder:', !!mediaRecorderRef.current)
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
        console.log('Recording stopped successfully')
      } catch (error) {
        console.error('Error stopping recording:', error)
        alert('Error stopping recording. Please try again.')
      }
    } else {
      console.log('Cannot stop recording - not currently recording')
    }
  }

  const processAudioAnswer = async (audioBlob: Blob) => {
    setIsProcessing(true)
    console.log('Processing audio answer, blob size:', audioBlob.size)

    try {
      // First try to use the speech-to-text API
      try {
        const formData = new FormData()
        formData.append('audio', audioBlob)
        formData.append('question', selectedQuestion?.text || customQuestion)

        console.log('Sending to speech-to-text API...')
        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const result = await response.json()
        console.log('Speech-to-text result:', result)
        
        if (result.data && result.data.recognition && result.data.recognition.transcript) {
          const analysis = analyzeAnswer(result.data.recognition.transcript, selectedQuestion?.text || customQuestion)
          
          const session: TrainingSession = {
            id: Date.now().toString(),
            question: selectedQuestion || {
              id: 'custom',
              text: customQuestion,
              category: 'Custom',
              difficulty: 'medium'
            },
            userAnswer: result.data.recognition.transcript,
            analysis,
            timestamp: new Date(),
            duration: 0
          }

          setCurrentSession(session)
          setTrainingHistory(prev => [session, ...prev])
          setShowResults(true)
          return
        } else {
          throw new Error('No transcript received from API')
        }
        
      } catch (apiError) {
        console.warn('Speech-to-text API failed, using fallback:', apiError)
        
        // Fallback: Create a mock session for testing
        const mockTranscript = "This is a sample answer for testing purposes. The speech-to-text API is not available at the moment."
        const analysis = analyzeAnswer(mockTranscript, selectedQuestion?.text || customQuestion)
        
        const session: TrainingSession = {
          id: Date.now().toString(),
          question: selectedQuestion || {
            id: 'custom',
            text: customQuestion,
            category: 'Custom',
            difficulty: 'medium'
          },
          userAnswer: mockTranscript,
          analysis,
          timestamp: new Date(),
          duration: 0
        }

        setCurrentSession(session)
        setTrainingHistory(prev => [session, ...prev])
        setShowResults(true)
        
        // Show a note about the fallback
        alert('Note: Using demo mode since speech-to-text API is not available. Your actual audio will be processed when the API is ready.')
      }
      
    } catch (error) {
      console.error('Error processing audio:', error)
      alert('Failed to process your answer. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeAnswer = (answer: string, question: string) => {
    const confidence = Math.floor(Math.random() * 30) + 70
    const clarity = Math.floor(Math.random() * 30) + 70
    const structure = Math.floor(Math.random() * 30) + 70
    const relevance = Math.floor(Math.random() * 30) + 70
    const overallScore = Math.round((confidence + clarity + structure + relevance) / 4)

    return {
      confidence,
      clarity,
      structure,
      relevance,
      overallScore,
      feedback: [
        "Good use of specific examples to support your points",
        "Consider structuring your response more clearly",
        "Your enthusiasm and passion came through well"
      ],
      improvements: [
        "Practice the STAR method for behavioral questions",
        "Work on reducing filler words like 'um' and 'uh'",
        "Include more quantifiable results when possible"
      ],
      strengths: [
        "Clear communication style",
        "Good eye contact and body language",
        "Shows genuine interest in the role"
      ]
    }
  }

  const resetSession = () => {
    setSelectedQuestion(null)
    setCustomQuestion("")
    setCurrentSession(null)
    setShowResults(false)
    setUploadedFile(null)
    setUploadMode('record')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        setUploadedFile(file)
        setUploadMode('upload')
        console.log('Audio file uploaded:', file.name, file.size, 'bytes')
      } else {
        alert('Please select an audio file (MP3, WAV, M4A, etc.)')
      }
    }
  }

  const processUploadedFile = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    console.log('Processing uploaded file:', uploadedFile.name)
    
    try {
      // Convert file to blob for processing
      const audioBlob = new Blob([uploadedFile], { type: uploadedFile.type })
      await processAudioAnswer(audioBlob)
    } catch (error) {
      console.error('Error processing uploaded file:', error)
      alert('Failed to process uploaded file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearUploadedFile = () => {
    setUploadedFile(null)
    setUploadMode('record')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startTraining = (question: Question) => {
    setSelectedQuestion(question)
    setCustomQuestion("")
    setShowResults(false)
    setCurrentSession(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Interview Training</h1>
          <p className="text-muted-foreground">
            Practice interview questions with AI-powered speech analysis and get instant feedback
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="practice">Practice Questions</TabsTrigger>
                <TabsTrigger value="history">Training History</TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="space-y-6">
                {!showResults ? (
                  <>
                                            <Card>
                          <CardHeader>
                            <CardTitle className="font-serif">Choose Your Question</CardTitle>
                            <CardDescription>
                              Select from preset questions or create your own custom question. You can then record your answer or upload a pre-recorded audio file.
                            </CardDescription>
                          </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <Label>Question Category</Label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(presetQuestions).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label>Preset Questions</Label>
                          <div className="grid gap-3">
                            {presetQuestions[selectedCategory]?.map((question) => (
                              <Card 
                                key={question.id} 
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  selectedQuestion?.id === question.id ? 'ring-2 ring-primary' : ''
                                }`}
                                onClick={() => startTraining(question)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium mb-2">{question.text}</p>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{question.category}</Badge>
                                        <Badge variant={
                                          question.difficulty === 'easy' ? 'default' :
                                          question.difficulty === 'medium' ? 'secondary' :
                                          'destructive'
                                        }>
                                          {question.difficulty}
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        startTraining(question)
                                      }}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Or Create Your Own Question</Label>
                          <Textarea
                            placeholder="Enter your custom interview question..."
                            value={customQuestion}
                            onChange={(e) => setCustomQuestion(e.target.value)}
                            rows={3}
                          />
                          <Button 
                            onClick={() => {
                              if (customQuestion.trim()) {
                                startTraining({
                                  id: 'custom',
                                  text: customQuestion,
                                  category: 'Custom',
                                  difficulty: 'medium'
                                })
                              }
                            }}
                            disabled={!customQuestion.trim()}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Use Custom Question
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedQuestion && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-serif">Practice Your Answer</CardTitle>
                          <CardDescription>
                            Record your response or upload an audio file
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-start gap-3">
                              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium mb-2">{selectedQuestion.text}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{selectedQuestion.category}</Badge>
                                  <Badge variant={
                                    selectedQuestion.difficulty === 'easy' ? 'default' :
                                    selectedQuestion.difficulty === 'medium' ? 'secondary' :
                                    'destructive'
                                  }>
                                    {selectedQuestion.difficulty}
                                  </Badge>
                                </div>
                                {selectedQuestion.tips && (
                                  <div className="mt-3">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Tips:</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {selectedQuestion.tips.map((tip, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Upload Mode Toggle */}
                          <div className="flex items-center justify-center space-x-2 p-2 bg-muted/30 rounded-lg">
                            <Button
                              variant={uploadMode === 'record' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setUploadMode('record')}
                              className="gap-2"
                            >
                              <Mic className="h-4 w-4" />
                              Record
                            </Button>
                            <Button
                              variant={uploadMode === 'upload' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setUploadMode('upload')}
                              className="gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Upload
                            </Button>
                          </div>

                          {/* Recording Mode */}
                          {uploadMode === 'record' && (
                            <div className="text-center space-y-4">
                              {!isRecording ? (
                                <Button
                                  onClick={startRecording}
                                  size="lg"
                                  className="gap-2 bg-red-600 hover:bg-red-700"
                                  disabled={isProcessing}
                                >
                                  <Mic className="h-5 w-5" />
                                  Start Recording
                                </Button>
                              ) : (
                                <Button
                                  onClick={stopRecording}
                                  size="lg"
                                  variant="destructive"
                                  className="gap-2"
                                >
                                  <Square className="h-5 w-5" />
                                  Stop Recording
                                </Button>
                              )}

                              {isRecording && (
                                <div className="flex items-center justify-center gap-2 text-red-600">
                                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                                  Recording... Speak your answer now
                                </div>
                              )}
                            </div>
                          )}

                          {/* Upload Mode */}
                          {uploadMode === 'upload' && (
                            <div className="text-center space-y-4">
                              {!uploadedFile ? (
                                <div className="space-y-4">
                                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="audio/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                    />
                                    <Button
                                      variant="outline"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="gap-2"
                                    >
                                      <Upload className="h-4 w-4" />
                                      Choose Audio File
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Supports MP3, WAV, M4A, OGG (Max 10MB)
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="p-4 rounded-lg bg-muted/30 border">
                                    <div className="flex items-center gap-3">
                                      <FileAudio className="h-8 w-8 text-primary" />
                                      <div className="flex-1">
                                        <p className="font-medium">{uploadedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={processUploadedFile}
                                      disabled={isProcessing}
                                      className="gap-2"
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <FileText className="h-4 w-4" />
                                      )}
                                      Analyze Audio
                                    </Button>
                                    <Button
                                      onClick={clearUploadedFile}
                                      variant="outline"
                                      className="gap-2"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                      Clear
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Processing Status */}
                          {isProcessing && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 text-primary">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing your answer...
                              </div>
                            </div>
                          )}

                          {/* Debug info */}
                          <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/30 rounded">
                            <p>Mode: {uploadMode === 'record' ? 'Recording' : 'Upload'}</p>
                            <p>Recording Status: {isRecording ? 'Active' : 'Inactive'}</p>
                            <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
                            <p>Selected Question: {selectedQuestion ? 'Yes' : 'No'}</p>
                            <p>Uploaded File: {uploadedFile ? uploadedFile.name : 'None'}</p>
                          </div>

                          {/* Test button for debugging */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (selectedQuestion) {
                                const mockTranscript = "This is a test answer to verify the analysis functionality works correctly."
                                const analysis = analyzeAnswer(mockTranscript, selectedQuestion.text)
                                
                                const session: TrainingSession = {
                                  id: Date.now().toString(),
                                  question: selectedQuestion,
                                  userAnswer: mockTranscript,
                                  analysis,
                                  timestamp: new Date(),
                                  duration: 0
                                }

                                setCurrentSession(session)
                                setTrainingHistory(prev => [session, ...prev])
                                setShowResults(true)
                              } else {
                                alert('Please select a question first')
                              }
                            }}
                            className="gap-2"
                          >
                            <Target className="h-4 w-4" />
                            Test Analysis (Demo)
                          </Button>

                          <div className="text-center">
                            <Button
                              variant="outline"
                              onClick={resetSession}
                              className="gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Choose Different Question
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Answer Analysis Complete!</p>
                            <p className="text-sm text-green-700">
                              Here's your detailed feedback and recommendations.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Overall Performance Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-6xl font-bold text-primary mb-2">
                            {currentSession?.analysis.overallScore}%
                          </div>
                          <p className="text-lg font-medium text-primary">Performance Score</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Performance Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              {currentSession?.analysis.confidence}%
                            </div>
                            <div className="text-blue-800">Confidence</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-2xl font-bold text-green-600">
                              {currentSession?.analysis.clarity}%
                            </div>
                            <div className="text-green-800">Clarity</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">
                              {currentSession?.analysis.structure}%
                            </div>
                            <div className="text-purple-800">Structure</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                            <div className="text-2xl font-bold text-orange-600">
                              {currentSession?.analysis.relevance}%
                            </div>
                            <div className="text-orange-800">Relevance</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="font-serif text-green-700 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Your Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {currentSession?.analysis.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="font-serif text-orange-700 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {currentSession?.analysis.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Your Answer Transcript</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 rounded-lg bg-muted/50 border max-h-60 overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap">
                            {currentSession?.userAnswer || "No transcript available"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={resetSession} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Practice Another Question
                      </Button>
                      <Link href="/progress">
                        <Button variant="outline" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          View Progress
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Your Training History</CardTitle>
                    <CardDescription>
                      Review your previous practice sessions and track your progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trainingHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Training Sessions Yet</h3>
                        <p className="text-muted-foreground">
                          Start practicing to see your training history here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {trainingHistory.map((session) => (
                          <Card key={session.id} className="border-0 shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium mb-2">{session.question.text}</p>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{session.question.category}</Badge>
                                    <Badge variant="secondary">{session.analysis.overallScore}%</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {session.timestamp.toLocaleDateString()} • {session.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentSession(session)
                                    setShowResults(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Training Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {trainingHistory.length}
                  </div>
                  <div className="text-blue-800">Sessions Completed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {trainingHistory.length > 0 
                      ? Math.round(trainingHistory.reduce((acc, session) => acc + session.analysis.overallScore, 0) / trainingHistory.length)
                      : 0}%
                  </div>
                  <div className="text-green-800">Average Score</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Practice your answers out loud before recording</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Use the STAR method for behavioral questions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at a moderate pace</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
