"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  FileText,
  Download,
  Search,
  Edit3,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Share2,
  Clock,
  Calendar,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { SpeechExportButton } from "@/components/export-button"
import { pdfExportService, SpeechAnalysisData } from "@/lib/pdf-export"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

// Mock transcript data
const mockTranscripts = [
  {
    id: 1,
    title: "Software Engineer Interview Practice",
    date: "2024-01-15",
    duration: "25:30",
    status: "completed",
    transcript: "Interviewer: Tell me about a challenging project you worked on.\n\nCandidate: I worked on a microservices architecture migration that involved...\n\nInterviewer: How did you handle the challenges?\n\nCandidate: We used a phased approach, starting with...",
    confidence: 87,
    speakingRate: 145,
    fillerWords: 3,
  },
  {
    id: 2,
    title: "Product Manager Mock Interview",
    date: "2024-01-14",
    duration: "32:15",
    status: "completed",
    transcript: "Interviewer: How do you prioritize features?\n\nCandidate: I use a framework that considers user impact...\n\nInterviewer: Can you give me an example?\n\nCandidate: Sure, when we were building the mobile app...",
    confidence: 92,
    speakingRate: 138,
    fillerWords: 1,
  },
  {
    id: 3,
    title: "Data Scientist Interview Prep",
    date: "2024-01-13",
    duration: "28:45",
    status: "completed",
    transcript: "Interviewer: Explain your approach to A/B testing.\n\nCandidate: I start by defining clear hypotheses...\n\nInterviewer: How do you determine sample size?\n\nCandidate: I use statistical power analysis...",
    confidence: 85,
    speakingRate: 142,
    fillerWords: 5,
  },
]

export default function TranscriptPage() {
  const [selectedTranscript, setSelectedTranscript] = useState(mockTranscripts[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  const filteredTranscripts = mockTranscripts.filter(transcript =>
    transcript.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transcript.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(selectedTranscript.transcript)
  }

  const handleExport = async (format: 'pdf' | 'json' | 'txt') => {
    if (!selectedTranscript) return

    const speechData: SpeechAnalysisData = {
      confidence: selectedTranscript.confidence,
      speakingRate: selectedTranscript.speakingRate,
      fillerWords: selectedTranscript.fillerWords,
      transcript: selectedTranscript.transcript,
      feedback: [
        `Confidence level: ${selectedTranscript.confidence}%`,
        `Speaking rate: ${selectedTranscript.speakingRate} WPM`,
        `Filler words used: ${selectedTranscript.fillerWords}`,
        'Practice speaking clearly and confidently',
        'Work on reducing filler words',
        'Maintain consistent speaking pace'
      ],
      timestamp: selectedTranscript.date
    }

    try {
      await pdfExportService.exportSpeechAnalysis(speechData, {
        format,
        filename: `speech-analysis-${selectedTranscript.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'Speech Analysis Report',
        subtitle: selectedTranscript.title
      })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-background p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Transcripts</h1>
              <p className="text-muted-foreground">Review and analyze your interview practice sessions</p>
            </div>
          </div>
          
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transcripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 minimal-shadow"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
              <Button className="gap-2 minimal-shadow">
                <Mic className="h-4 w-4" />
                New Session
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript List */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <Card className="minimal-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
                <CardDescription>Your interview practice transcripts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTranscripts.map((transcript) => (
                  <motion.div
                    key={transcript.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedTranscript?.id === transcript.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedTranscript(transcript)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground line-clamp-2">
                        {transcript.title}
                      </h3>
                      <Badge variant={transcript.status === 'completed' ? 'default' : 'secondary'}>
                        {transcript.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {transcript.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {transcript.duration}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Transcript Viewer */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            {selectedTranscript ? (
              <Card className="minimal-card h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{selectedTranscript.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {selectedTranscript.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedTranscript.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          John Doe
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePlayPause}
                        className="gap-2"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyTranscript}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {selectedTranscript.confidence}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {selectedTranscript.speakingRate}
                      </div>
                      <div className="text-sm text-muted-foreground">WPM</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {selectedTranscript.fillerWords}
                      </div>
                      <div className="text-sm text-muted-foreground">Filler Words</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Transcript Content */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
                      <SpeechExportButton onExport={handleExport} />
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {selectedTranscript.transcript.split('\n\n').map((section, index) => (
                          <div key={index} className="space-y-2">
                            {section.split('\n').map((line, lineIndex) => {
                              if (line.startsWith('Interviewer:')) {
                                return (
                                  <div key={lineIndex} className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                      <User className="h-3 w-3 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-primary mb-1">Interviewer</div>
                                      <div className="text-foreground">{line.replace('Interviewer:', '').trim()}</div>
                                    </div>
                                  </div>
                                )
                              } else if (line.startsWith('Candidate:')) {
                                return (
                                  <div key={lineIndex} className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                      <MessageSquare className="h-3 w-3 text-secondary" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-secondary mb-1">You</div>
                                      <div className="text-foreground">{line.replace('Candidate:', '').trim()}</div>
                                    </div>
                                  </div>
                                )
                              } else if (line.trim()) {
                                return (
                                  <div key={lineIndex} className="text-muted-foreground text-sm italic pl-9">
                                    {line.trim()}
                                  </div>
                                )
                              }
                              return null
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="minimal-card h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No transcript selected</h3>
                  <p>Choose a transcript from the list to view its details</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
