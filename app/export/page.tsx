"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  FileText,
  Calendar,
  User,
  Target,
  Mic,
  CheckCircle2,
  Clock,
  Settings,
  Share2,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

const exportOptions = {
  resumeAnalysis: {
    name: "Resume Analysis History",
    description: "Complete history of all resume analysis sessions with scores and feedback",
    formats: ["PDF", "CSV", "JSON"],
    size: "2.3 MB",
    icon: FileText,
  },
  speechAnalysis: {
    name: "Speech Analysis History",
    description: "Audio analysis results, transcripts, and improvement feedback",
    formats: ["PDF", "CSV", "JSON"],
    size: "1.8 MB",
    icon: Mic,
  },
  chatHistory: {
    name: "Chat History",
    description: "Complete conversation history with AI career assistant",
    formats: ["CSV", "JSON", "PDF"],
    size: "1.5 MB",
    icon: MessageCircle,
  },
  profile: {
    name: "Profile Data",
    description: "Personal information and account settings",
    formats: ["JSON", "PDF"],
    size: "0.5 MB",
    icon: User,
  },
  comprehensiveAnalysis: {
    name: "Comprehensive Analysis",
    description: "Resume-job matching analysis and targeted recommendations",
    formats: ["PDF", "CSV", "JSON"],
    size: "1.2 MB",
    icon: Target,
  },
  exportData: {
    name: "All Data Export",
    description: "Complete export of all your data in one package",
    formats: ["ZIP", "JSON"],
    size: "8.5 MB",
    icon: Download,
  },
}

export default function ExportPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [dateRange, setDateRange] = useState("all")
  const [format, setFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [resumeAnalysisHistory, setResumeAnalysisHistory] = useState<any[]>([])
  const [speechAnalysisHistory, setSpeechAnalysisHistory] = useState<any[]>([])
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const supabase = createClient()

  // Load user data on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      if (!supabase) {
        console.log("Supabase client not available")
        return
      }
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.log("User not authenticated")
        return
      }

      // Load resume analysis history
      const { data: resumeData, error: resumeError } = await supabase
        .from("resume_analysis")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!resumeError && resumeData) {
        setResumeAnalysisHistory(resumeData)
      }

      // Load speech analysis history
      const { data: speechData, error: speechError } = await supabase
        .from("speech_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!speechError && speechData) {
        setSpeechAnalysisHistory(speechData)
      }

      // Load chat history
      const { data: chatData, error: chatError } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })

      if (!chatError && chatData) {
        setChatHistory(chatData)
      }

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!profileError && profileData) {
        setUserProfile(profileData)
      }

    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleItemToggle = (itemKey: string) => {
    setSelectedItems((prev) => (prev.includes(itemKey) ? prev.filter((item) => item !== itemKey) : [...prev, itemKey]))
  }

  const handleSelectAll = () => {
    if (selectedItems.length === Object.keys(exportOptions).length) {
      setSelectedItems([])
    } else {
      setSelectedItems(Object.keys(exportOptions))
    }
  }

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to export")
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Prepare export data based on selected items
      const exportData: any = {
        exportDate: new Date().toISOString(),
        format: format,
        dateRange: dateRange,
        data: {}
      }

      // Add selected data
      if (selectedItems.includes('resumeAnalysis')) {
        exportData.data.resumeAnalysis = resumeAnalysisHistory
      }
      
      if (selectedItems.includes('speechAnalysis')) {
        exportData.data.speechAnalysis = speechAnalysisHistory
      }
      
      if (selectedItems.includes('chatHistory')) {
        exportData.data.chatHistory = chatHistory
      }
      
      if (selectedItems.includes('profile')) {
        exportData.data.profile = userProfile
      }
      
      if (selectedItems.includes('comprehensiveAnalysis')) {
        // This would include resume-job matching data if available
        exportData.data.comprehensiveAnalysis = {
          note: "Comprehensive analysis data would be included here"
        }
      }

      // Simulate export progress
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsExporting(false)
            
            // Actually download the file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
              type: 'application/json' 
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `career-data-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            
            alert(`Export completed! Downloaded ${selectedItems.length} data items.`)
            return 100
          }
          return prev + 10
        })
      }, 300)
    } catch (error) {
      console.error("Export error:", error)
      alert("Export failed. Please try again.")
      setIsExporting(false)
    }
  }

  const getTotalSize = () => {
    return selectedItems
      .reduce((total, key) => {
        const size = Number.parseFloat(exportOptions[key as keyof typeof exportOptions].size)
        return total + size
      }, 0)
      .toFixed(1)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Export Data</h1>
          <p className="text-muted-foreground">Download your career analysis data, speech records, and chat history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Share Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Export Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">Export Data</TabsTrigger>
          <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-6">
          
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Export Options */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif">Select Data to Export</CardTitle>
                      <CardDescription>Choose which data you want to include in your export</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSelectAll} className="bg-transparent">
                      {selectedItems.length === Object.keys(exportOptions).length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(exportOptions).map(([key, option]) => (
                    <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                      <Checkbox
                        id={key}
                        checked={selectedItems.includes(key)}
                        onCheckedChange={() => handleItemToggle(key)}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <option.icon className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={key} className="font-medium cursor-pointer">
                              {option.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{option.size}</Badge>
                            <div className="flex gap-1 mt-1">
                              {option.formats.map((fmt) => (
                                <Badge key={fmt} variant="outline" className="text-xs">
                                  {fmt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Export Options</CardTitle>
                  <CardDescription>Configure your export settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="format">Export Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Report</SelectItem>
                          <SelectItem value="csv">CSV Files</SelectItem>
                          <SelectItem value="json">JSON Data</SelectItem>
                          <SelectItem value="excel">Excel Workbook</SelectItem>
                          <SelectItem value="zip">ZIP Archive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                          <SelectItem value="90d">Last 3 Months</SelectItem>
                          <SelectItem value="1y">Last Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="includeMedia" />
                      <Label htmlFor="includeMedia">Include audio recordings and media files</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="anonymize" />
                      <Label htmlFor="anonymize">Anonymize personal information</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compress" defaultChecked />
                      <Label htmlFor="compress">Compress files to reduce size</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Selected Items</span>
                      <span className="font-medium">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Size</span>
                      <span className="font-medium">{getTotalSize()} MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format</span>
                      <span className="font-medium uppercase">{format}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date Range</span>
                      <span className="font-medium">
                        {dateRange === "all" ? "All Time" : dateRange === "30d" ? "30 Days" : "Custom"}
                      </span>
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Exporting...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    onClick={handleExport}
                    disabled={selectedItems.length === 0 || isExporting}
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export Data"}
                  </Button>
                  
                  {/* Data Preview */}
                  {selectedItems.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground">Data Preview:</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedItems.includes('resumeAnalysis') && resumeAnalysisHistory.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            📄 Resume Analysis: {resumeAnalysisHistory.length} records
                          </div>
                        )}
                        {selectedItems.includes('speechAnalysis') && speechAnalysisHistory.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            🎤 Speech Analysis: {speechAnalysisHistory.length} records
                          </div>
                        )}
                        {selectedItems.includes('chatHistory') && chatHistory.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            💬 Chat History: {chatHistory.length} conversations
                          </div>
                        )}
                        {selectedItems.includes('profile') && userProfile && (
                          <div className="text-xs text-muted-foreground">
                            👤 Profile: {userProfile.full_name || 'User Profile'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Quick Exports</CardTitle>
                  <CardDescription>Pre-configured export options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                    <FileText className="h-4 w-4" />
                    Resume Analysis (JSON)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                    <Mic className="h-4 w-4" />
                    Speech Records (JSON)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                    <MessageCircle className="h-4 w-4" />
                    Chat History (JSON)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Resume Analysis Report",
                description: "Comprehensive resume feedback and improvement recommendations",
                icon: FileText,
                format: "PDF",
                pages: "8-12 pages",
              },
              {
                title: "Speech Analysis Report",
                description: "In-depth analysis of your communication skills and feedback",
                icon: Mic,
                format: "PDF",
                pages: "10-15 pages",
              },
              {
                title: "Career Development Summary",
                description: "Overview of your career goals and skill development",
                icon: Target,
                format: "PDF",
                pages: "6-8 pages",
              },
              {
                title: "Interview Preparation Report",
                description: "Complete interview readiness assessment and tips",
                icon: CheckCircle2,
                format: "PDF",
                pages: "12-15 pages",
              },
              {
                title: "Skills Gap Analysis",
                description: "Detailed breakdown of your technical and soft skills",
                icon: Target,
                format: "PDF",
                pages: "8-10 pages",
              },
              {
                title: "Career Action Plan",
                description: "Personalized roadmap for your career development",
                icon: TrendingUp,
                format: "PDF",
                pages: "10-12 pages",
              },
            ].map((report, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                      <report.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-lg">{report.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Format</span>
                      <Badge variant="secondary">{report.format}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Length</span>
                      <span className="text-muted-foreground">{report.pages}</span>
                    </div>
                    <Button size="sm" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Export History</CardTitle>
              <CardDescription>Your last few exports and analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumeAnalysisHistory.length > 0 || speechAnalysisHistory.length > 0 || chatHistory.length > 0 ? (
                  <>
                    {resumeAnalysisHistory.slice(0, 3).map((analysis, index) => (
                      <div key={`resume-${index}`} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Resume Analysis - {new Date(analysis.created_at).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">ATS Score: {analysis.ats_score}% | Readability: {analysis.readability_score}%</p>
                          </div>
                        </div>
                        <Badge variant="outline">JSON</Badge>
                      </div>
                    ))}
                    
                    {speechAnalysisHistory.slice(0, 3).map((speech, index) => (
                      <div key={`speech-${index}`} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                            <Mic className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Speech Analysis - {new Date(speech.created_at).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">Score: {speech.overall_score}% | Duration: {Math.round(speech.duration / 60)}min</p>
                          </div>
                        </div>
                        <Badge variant="outline">JSON</Badge>
                      </div>
                    ))}
                    
                    {chatHistory.slice(0, 3).map((chat, index) => (
                      <div key={`chat-${index}`} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                            <MessageCircle className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">Chat Session - {new Date(chat.timestamp).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">Messages: 2 | Topic: Career advice</p>
                          </div>
                        </div>
                        <Badge variant="outline">JSON</Badge>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto mb-4">
                      <Download className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No export history yet</p>
                    <p className="text-sm text-muted-foreground">Start by exporting your data from the Export Data tab</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
