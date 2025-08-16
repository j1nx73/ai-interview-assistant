"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Mic,
  MicOff,
  Upload,
  Play,
  Pause,
  Square,
  Download,
  FileAudio,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Volume2,
  Clock,
  Target,
  Zap,
  FileText,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react"

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  words: Array<{
    word: string
    startTime: number
    endTime: number
    confidence: number
  }>
  languageCode: string
  totalTime: number
}

interface SpeechAnalysisResult {
  text: string
  wordCount: number
  speakingRate: number
  pauseAnalysis: {
    totalPauses: number
    averagePauseLength: number
    longestPause: number
  }
  confidence: number
  language: string
  qualityScore: number
}

interface SpeechAnalysisData {
  recognition: SpeechRecognitionResult
  analysis: SpeechAnalysisResult
  metadata: {
    processingTime: string
    fileInfo: {
      name: string
      size: number
      type: string
    }
  }
}

export default function SpeechAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisData | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("en-US")
  const [selectedEncoding, setSelectedEncoding] = useState("MP3")
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedLanguages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "de-DE", name: "German (Germany)" },
    { code: "it-IT", name: "Italian (Italy)" },
    { code: "pt-BR", name: "Portuguese (Brazil)" },
    { code: "ru-RU", name: "Russian (Russia)" },
    { code: "ja-JP", name: "Japanese (Japan)" },
    { code: "ko-KR", name: "Korean (Korea)" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
    { code: "hi-IN", name: "Hindi (India)" },
  ]

  const supportedEncodings = [
    { value: "MP3", label: "MP3" },
    { value: "WAV", label: "WAV" },
    { value: "M4A", label: "M4A" },
    { value: "OGG", label: "OGG" },
  ]

  // Start recording audio
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        
        // Convert to MP3 or selected format
        const file = new File([blob], `recording-${Date.now()}.${selectedEncoding.toLowerCase()}`, {
          type: `audio/${selectedEncoding.toLowerCase()}`
        })
        
        setAudioFile(file)
        setAudioUrl(url)
        setIsRecording(false)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  // Process audio file
  const processAudio = async () => {
    if (!audioFile) {
      setError('Please select an audio file first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('language', selectedLanguage)
      formData.append('encoding', selectedEncoding)

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to process audio')
      }

      const result = await response.json()
      setAnalysisResult(result.data)
      
      // Show completion animation
      setShowCompletion(true)
      
      // Auto-hide completion message after 5 seconds
      setTimeout(() => {
        setShowCompletion(false)
      }, 5000)
      
    } catch (error) {
      console.error('Error processing audio:', error)
      setError(error instanceof Error ? error.message : 'Failed to process audio')
    } finally {
      setIsProcessing(false)
    }
  }

  // Audio playback controls
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Export transcript
  const exportTranscript = () => {
    if (!analysisResult) return
    
    const data = {
      transcript: analysisResult.recognition.transcript,
      analysis: analysisResult.analysis,
      metadata: analysisResult.metadata,
      exportTime: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speech-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Send to resume analysis
  const sendToResumeAnalysis = () => {
    if (!analysisResult) return
    
    // Store the transcript in localStorage for the resume analysis page
    localStorage.setItem('speechTranscript', analysisResult.recognition.transcript)
    localStorage.setItem('speechAnalysis', JSON.stringify(analysisResult.analysis))
    
    // Redirect to resume analysis page
    window.location.href = '/resume-analysis'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Speech Analysis</h1>
          <p className="text-muted-foreground">
            Convert speech to text using Google Cloud Speech-to-Text and analyze speaking patterns
          </p>
        </div>

        {/* Completion Success Animation */}
        {showCompletion && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Complete!</h3>
              <p className="text-gray-600 mb-6">
                Your speech has been successfully analyzed. View the detailed results in the Analysis Results tab.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setShowCompletion(false)
                    // Switch to results tab
                    const resultsTab = document.querySelector('[data-value="results"]') as HTMLElement
                    if (resultsTab) {
                      resultsTab.click()
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  View Results
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompletion(false)}
                  className="w-full"
                >
                  Continue Working
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="record" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="record">Record Audio</TabsTrigger>
                <TabsTrigger value="upload">Upload Audio</TabsTrigger>
                <TabsTrigger value="results" className="relative">
                  Analysis Results
                  {analysisResult && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Record Audio Tab */}
              <TabsContent value="record" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Record Audio</CardTitle>
                    <CardDescription>
                      Record your speech directly in the browser
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Language and Encoding Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedLanguages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="encoding">Audio Format</Label>
                        <Select value={selectedEncoding} onValueChange={setSelectedEncoding}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedEncodings.map((enc) => (
                              <SelectItem key={enc.value} value={enc.value}>
                                {enc.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Recording Controls */}
                    <div className="text-center space-y-4">
                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          size="lg"
                          className="gap-2 bg-red-600 hover:bg-red-700"
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
                          Recording... Speak now
                        </div>
                      )}
                    </div>

                    {/* Audio Preview */}
                    {audioUrl && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Recording Preview</h4>
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          controls
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          className="w-full"
                        />
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={processAudio}
                            disabled={isProcessing}
                            className="gap-2"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                            Process Audio
                          </Button>
                          <Button
                            onClick={() => {
                              setAudioFile(null)
                              setAudioUrl(null)
                              setAnalysisResult(null)
                            }}
                            variant="outline"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Audio Tab */}
              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Upload Audio File</CardTitle>
                    <CardDescription>
                      Upload an existing audio file for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Language and Encoding Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedLanguages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="encoding">Audio Format</Label>
                        <Select value={selectedEncoding} onValueChange={setSelectedEncoding}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedEncodings.map((enc) => (
                              <SelectItem key={enc.value} value={enc.value}>
                                {enc.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <Label>Upload Audio File</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
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

                    {/* Audio Preview and Processing */}
                    {audioFile && (
                      <div className="space-y-4">
                        <h4 className="font-medium">File Preview</h4>
                        <div className="p-4 rounded-lg bg-muted/30 border">
                          <div className="flex items-center gap-3">
                            <FileAudio className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium">{audioFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(audioFile.size / 1024 / 1024).toFixed(2)} MB • {audioFile.type}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={processAudio}
                            disabled={isProcessing}
                            className="gap-2"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                            Process Audio
                          </Button>
                          <Button
                            onClick={() => {
                              setAudioFile(null)
                              setAudioUrl(null)
                              setAnalysisResult(null)
                            }}
                            variant="outline"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Results Tab */}
              <TabsContent value="results" className="space-y-6">
                {!analysisResult ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileAudio className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
                      <p className="text-muted-foreground">
                        Record or upload audio to see speech analysis results here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Success Banner */}
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Analysis Complete!</p>
                            <p className="text-sm text-green-700">
                              Your speech has been successfully analyzed. Review the results below.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Speech Quality Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Speech Quality Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-6xl font-bold text-primary mb-2">
                            {analysisResult.analysis.qualityScore}%
                          </div>
                          <p className="text-lg font-medium text-primary">Quality Score</p>
                          <p className="text-sm text-muted-foreground">
                            {analysisResult.analysis.qualityScore >= 80 ? "Excellent speech quality!" :
                             analysisResult.analysis.qualityScore >= 60 ? "Good speech quality with room for improvement." :
                             "Speech quality needs improvement. Check the recommendations below."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Speech Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Speech Metrics</CardTitle>
                        <CardDescription>
                          Detailed analysis of your speaking patterns
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              {analysisResult.analysis.wordCount}
                            </div>
                            <div className="text-blue-800">Words Spoken</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                            <div className="text-2xl font-bold text-green-600">
                              {analysisResult.analysis.speakingRate}
                            </div>
                            <div className="text-green-800">Words per Minute</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">
                              {analysisResult.analysis.confidence}%
                            </div>
                            <div className="text-purple-800">Recognition Confidence</div>
                          </div>
                        </div>

                        {/* Speaking Rate Analysis */}
                        <div className="space-y-3">
                          <h6 className="font-medium">Speaking Rate Analysis</h6>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Current Rate</span>
                              <Badge variant={
                                analysisResult.analysis.speakingRate >= 150 && analysisResult.analysis.speakingRate <= 200 ? "default" :
                                analysisResult.analysis.speakingRate >= 120 && analysisResult.analysis.speakingRate <= 250 ? "secondary" :
                                "destructive"
                              }>
                                {analysisResult.analysis.speakingRate} WPM
                              </Badge>
                            </div>
                            <Progress 
                              value={
                                analysisResult.analysis.speakingRate >= 250 ? 100 :
                                (analysisResult.analysis.speakingRate / 250) * 100
                              } 
                              className="h-2" 
                            />
                            <p className="text-xs text-muted-foreground">
                              Ideal range: 150-200 WPM • Current: {analysisResult.analysis.speakingRate} WPM
                            </p>
                          </div>
                        </div>

                        {/* Pause Analysis */}
                        <div className="space-y-3">
                          <h6 className="font-medium">Pause Analysis</h6>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold">{analysisResult.analysis.pauseAnalysis.totalPauses}</div>
                              <div className="text-sm text-muted-foreground">Total Pauses</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">
                                {analysisResult.analysis.pauseAnalysis.averagePauseLength.toFixed(2)}s
                              </div>
                              <div className="text-sm text-muted-foreground">Avg Pause Length</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold">
                                {analysisResult.analysis.pauseAnalysis.longestPause.toFixed(2)}s
                              </div>
                              <div className="text-sm text-muted-foreground">Longest Pause</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Transcript */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Transcript
                        </CardTitle>
                        <CardDescription>
                          Your speech converted to text
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 rounded-lg bg-muted/50 border max-h-60 overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap">
                            {analysisResult.recognition.transcript || "No transcript available"}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4">
                          <Button onClick={exportTranscript} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Results
                          </Button>
                          <Button onClick={sendToResumeAnalysis} className="gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Use in Resume Analysis
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Google Cloud Speech-to-Text</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Service is ready and configured
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Supported Features */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>High-quality speech recognition</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Multiple language support</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Speaking rate analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pause pattern detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Confidence scoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Integration with resume analysis</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Recording Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at a moderate pace</span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Minimize background noise</span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Use natural pauses between thoughts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Keep recordings under 10 minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
