"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  FileText, 
  Mic, 
  MessageSquare, 
  User, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import { addDays, format as formatDate } from "date-fns"

// Mock data for demonstration
const mockResumeAnalysis = [
  {
    id: "1",
    title: "Software Engineer Resume",
    score: 85,
    created_at: new Date().toISOString(),
    feedback: "Strong technical skills, good formatting"
  },
  {
    id: "2", 
    title: "Product Manager Resume",
    score: 78,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    feedback: "Good experience, could improve metrics"
  }
]

const mockSpeechAnalysis = [
  {
    id: "1",
    title: "Behavioral Interview Practice",
    score: 82,
    created_at: new Date().toISOString(),
    feedback: "Good pace, clear articulation"
  },
  {
    id: "2",
    title: "Technical Interview Practice", 
    score: 75,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    feedback: "Technical content good, speaking could improve"
  }
]

const mockChatHistory = [
  {
    id: "1",
    message: "How can I improve my interview skills?",
    response: "Practice common questions, work on body language...",
    timestamp: new Date().toISOString()
  },
  {
    id: "2",
    message: "What are good questions to ask interviewers?",
    response: "Ask about company culture, growth opportunities...",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
]

const mockUserProfile = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  role: "Software Engineer"
}

export default function ExportPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [format, setFormat] = useState("pdf")
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [selectedItems, setSelectedItems] = useState<string[]>([
    'resumeAnalysis',
    'speechAnalysis', 
    'chatHistory',
    'userProfile'
  ])

  const exportOptions = {
    resumeAnalysis: {
      label: "Resume Analysis",
      icon: FileText,
      description: "Export your resume analysis history and feedback",
      data: mockResumeAnalysis
    },
    speechAnalysis: {
      label: "Speech Analysis", 
      icon: Mic,
      description: "Export your speech practice sessions and scores",
      data: mockSpeechAnalysis
    },
    chatHistory: {
      label: "Chat History",
      icon: MessageSquare, 
      description: "Export your AI chat conversations and advice",
      data: mockChatHistory
    },
    userProfile: {
      label: "User Profile",
      icon: User,
      description: "Export your profile information and preferences",
      data: mockUserProfile
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
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Prepare export data
      const exportData: any = {
        exportDate: new Date().toISOString(),
        format: format,
        dateRange: dateRange,
        data: {}
      }

      // Add selected data
      selectedItems.forEach(itemKey => {
        exportData.data[itemKey] = exportOptions[itemKey as keyof typeof exportOptions].data
      })

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-interview-export-${format}-${formatDate(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Your data has been exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const getTotalSize = () => {
    return selectedItems
      .reduce((total, key) => {
        const option = exportOptions[key as keyof typeof exportOptions]
        if (Array.isArray(option.data)) {
          return total + (option.data.length * 0.001) // Mock size calculation
        }
        return total + 0.001 // Mock size for non-array data
      }, 0)
      .toFixed(2)
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
            <Sparkles className="h-4 w-4" />
            Share Report
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <AlertCircle className="h-4 w-4" />
            Export Settings
          </Button>
        </div>
      </div>

      <Separator />

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
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Mock Data</Badge>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            JSON
                          </Badge>
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={formatDate(dateRange.from, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                      className="border rounded-md p-2"
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="date"
                      value={formatDate(dateRange.to, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                      className="border rounded-md p-2"
                    />
                  </div>
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
                    {formatDate(dateRange.from, 'MM/dd/yyyy')} - {formatDate(dateRange.to, 'MM/dd/yyyy')}
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
                    {selectedItems.includes('resumeAnalysis') && mockResumeAnalysis.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        �� Resume Analysis: {mockResumeAnalysis.length} records
                      </div>
                    )}
                    {selectedItems.includes('speechAnalysis') && mockSpeechAnalysis.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        🎤 Speech Analysis: {mockSpeechAnalysis.length} records
                      </div>
                    )}
                    {selectedItems.includes('chatHistory') && mockChatHistory.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        💬 Chat History: {mockChatHistory.length} conversations
                      </div>
                    )}
                    {selectedItems.includes('userProfile') && mockUserProfile && (
                      <div className="text-xs text-muted-foreground">
                        👤 Profile: {mockUserProfile.first_name} {mockUserProfile.last_name}
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
                <MessageSquare className="h-4 w-4" />
                Chat History (JSON)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
