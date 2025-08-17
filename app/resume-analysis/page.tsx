"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  FileText, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Download,
  History,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  BarChart3,
  Star,
  Zap
} from "lucide-react"

// Mock data for demonstration
const mockResumeData = {
  content: "Experienced software engineer with 5+ years in full-stack development...",
  sections: {
    contact: "John Doe\njohn.doe@email.com\n+1 (555) 123-4567",
    summary: "Passionate software engineer with expertise in React, Node.js, and cloud technologies...",
    experience: "Senior Software Engineer at Tech Corp (2020-Present)\n- Led development of web applications...",
    education: "Bachelor of Science in Computer Science\nUniversity of Technology (2015-2019)",
    skills: "JavaScript, React, Node.js, Python, AWS, Docker, Git"
  }
}

const mockAnalysis = {
  overallScore: 78,
  atsScore: 82,
  readabilityScore: 75,
  strengths: [
    "Strong technical skills section",
    "Clear work experience descriptions",
    "Good use of action verbs",
    "Appropriate length and formatting"
  ],
  weaknesses: [
    "Could include more quantifiable achievements",
    "Skills section could be more specific",
    "Summary could be more compelling",
    "Consider adding certifications"
  ],
  suggestions: [
    "Add specific metrics and numbers to achievements",
    "Include relevant certifications and training",
    "Tailor skills to match job requirements",
    "Strengthen the professional summary"
  ]
}

export default function ResumeAnalysisPage() {
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeContent, setResumeContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // Simulate file reading
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setResumeContent(content)
      }
      reader.readAsText(file)
    }
  }

  const handleAnalyze = async () => {
    if (!resumeContent.trim()) {
      toast({
        title: "No Resume Content",
        description: "Please upload a resume or paste content to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Use mock analysis result
      setAnalysisResult(mockAnalysis)
      
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed successfully!",
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

  const handleClear = () => {
    setResumeContent("")
    setJobDescription("")
    setUploadedFile(null)
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleExport = () => {
    if (!analysisResult) return
    
    const exportData = {
      resumeContent,
      jobDescription,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: "Your resume analysis has been exported.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Resume Analysis</h1>
          <p className="text-muted-foreground">
            Get AI-powered feedback on your resume with industry-specific insights and ATS optimization
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
                <TabsTrigger value="job">Job Analysis</TabsTrigger>
                <TabsTrigger value="results" className="relative">
                  Analysis Results
                  {analysisResult && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="comprehensive" className="relative">
                  Comprehensive
                  {analysisResult && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Upload & Analyze Tab */}
              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Resume Upload & Analysis</CardTitle>
                    <CardDescription>
                      Upload your resume or paste the content for AI-powered analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Industry & Level Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Target Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Add your industry options here */}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Experience Level</Label>
                        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Add your experience level options here */}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <Label>Upload Resume</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Processing..." : "Choose File"}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          Supports TXT files (Max 5MB)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 For PDFs & Word docs: Upload the file, then copy & paste the text content below
                        </p>
                      </div>
                    </div>

                    {/* Text Input Alternative */}
                    <div className="space-y-4">
                      <Label>Or Paste Resume Content</Label>
                      <Textarea
                        placeholder="Paste your resume content here for analysis..."
                        value={resumeContent}
                        onChange={(e) => setResumeContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleAnalyze}
                        disabled={!resumeContent.trim() || isAnalyzing}
                        size="lg"
                        className="gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Analyze Resume
                          </>
                        )}
                      </Button>

                      {resumeContent && (
                        <>
                          <Button
                            onClick={handleClear}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                          >
                            <Trash2 className="h-5 w-5" />
                            Clear
                          </Button>
                          <Button
                            onClick={handleExport}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                          >
                            <Download className="h-5 w-5" />
                            Export
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Resume Preview */}
                    {resumeContent && (
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4 text-primary" />
                          Resume Preview
                        </h4>
                        <div className="p-4 rounded-lg bg-muted/50 border max-h-60 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-sans">{resumeContent}</pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Job Analysis Tab */}
              <TabsContent value="job" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Job Description Analysis</CardTitle>
                    <CardDescription>
                      Analyze a job posting to get targeted resume improvement recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Job Details Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          placeholder="e.g., Senior Software Engineer"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="e.g., Google, Microsoft"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Job Description Input */}
                    <div className="space-y-4">
                      <Label>Job Description</Label>
                      <Textarea
                        placeholder="Paste the complete job description here... Include requirements, responsibilities, and qualifications."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[300px]"
                      />
                      <p className="text-sm text-muted-foreground">
                        💡 Tip: Copy the full job posting including requirements, responsibilities, and qualifications for the best analysis.
                      </p>
                    </div>

                    {/* Analysis Buttons */}
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleAnalyze}
                        disabled={!jobDescription.trim() || isAnalyzing}
                        size="lg"
                        className="gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Analyzing Job...
                          </>
                        ) : (
                          <>
                            <Target className="h-5 w-5" />
                            Analyze Job Requirements
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Results Tab */}
              <TabsContent value="results" className="space-y-6">
                {!analysisResult ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
                      <p className="text-muted-foreground">
                        Upload your resume and run analysis to see detailed feedback here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Score Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Star className="h-5 w-5 text-primary" />
                          Overall Resume Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-6xl font-bold text-primary">{analysisResult.overallScore}%</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>ATS Compatibility</span>
                              <Badge variant={analysisResult.atsScore >= 80 ? "default" : "secondary"}>
                                {analysisResult.atsScore}%
                              </Badge>
                            </div>
                            <Progress value={analysisResult.atsScore} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Readability</span>
                              <Badge variant={analysisResult.readabilityScore >= 70 ? "default" : "secondary"}>
                                {analysisResult.readabilityScore}%
                              </Badge>
                            </div>
                            <Progress value={analysisResult.readabilityScore} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section Scores */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Section Analysis</CardTitle>
                        <CardDescription>
                          Detailed breakdown of each resume section
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(analysisResult.sections).map(([section, data]: [string, any]) => (
                          <div key={section} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">{section}</span>
                              <Badge variant={data.score >= 80 ? "default" : data.score >= 60 ? "secondary" : "destructive"}>
                                {data.score}%
                              </Badge>
                            </div>
                            <Progress value={data.score} className="h-2" />
                            {data.feedback.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {data.feedback.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Detailed Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Improvement Recommendations
                        </CardTitle>
                        <CardDescription>
                          Prioritized suggestions to enhance your resume
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              suggestion.priority === "high" ? "bg-red-50 border-red-200" :
                              suggestion.priority === "medium" ? "bg-yellow-50 border-yellow-200" :
                              "bg-blue-50 border-blue-200"
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  suggestion.priority === "high" ? "bg-red-500" :
                                  suggestion.priority === "medium" ? "bg-yellow-500" :
                                  "bg-blue-500"
                                }`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-medium">{suggestion.title}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {suggestion.priority.toUpperCase()} PRIORITY
                                    </Badge>
                                  </div>
                                  <p className="text-sm mb-3">{suggestion.description}</p>
                                  <div className="space-y-2">
                                    <h6 className="text-xs font-medium uppercase tracking-wide">Action Items:</h6>
                                    <ul className="space-y-1">
                                      {suggestion.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="text-sm flex items-start gap-2">
                                          <span className="mt-1">•</span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Keywords Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          Keyword Analysis
                        </CardTitle>
                        <CardDescription>
                          Industry-specific keywords found and missing
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h6 className="font-medium mb-2 text-green-700">Keywords Found ({analysisResult.keywords.length})</h6>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.keywords.map((keyword, index) => (
                              <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h6 className="font-medium mb-2 text-red-700">Missing Keywords ({analysisResult.missingKeywords.length})</h6>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.missingKeywords.slice(0, 10).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-red-700 border-red-300">
                                {keyword}
                              </Badge>
                            ))}
                            {analysisResult.missingKeywords.length > 10 && (
                              <Badge variant="outline" className="text-muted-foreground">
                                +{analysisResult.missingKeywords.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Job-Specific Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Job-Specific Insights
                        </CardTitle>
                        <CardDescription>
                          How your resume matches against the analyzed job posting
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                          <div className="text-4xl font-bold text-primary mb-2">
                            {analysisResult.matchScore}%
                          </div>
                          <p className="text-lg font-medium text-primary">Job Match Score</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {jobDescription} at {industry}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-medium mb-2 text-green-700">Skills You Have</h6>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.keywords.filter(skill => 
                                analysisResult.keywords.some(keyword => 
                                  keyword.includes(skill) || skill.includes(keyword)
                                )
                              ).slice(0, 6).map((skill, index) => (
                                <Badge key={index} variant="default" className="bg-green-100 text-green-800 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="font-medium mb-2 text-red-700">Skills You Need</h6>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.missingKeywords.slice(0, 6).map((skill, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                          <h6 className="font-medium text-amber-800 mb-2">🎯 Next Steps</h6>
                          <ul className="text-sm text-amber-700 space-y-1">
                            <li>• Focus on developing the top 3-5 missing skills</li>
                            <li>• Update your resume to highlight relevant experience</li>
                            <li>• Consider taking relevant courses or certifications</li>
                            <li>• Network with professionals in the target company/industry</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Comprehensive Analysis Tab */}
              <TabsContent value="comprehensive" className="space-y-6">
                {!analysisResult ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Comprehensive Analysis</h3>
                      <p className="text-muted-foreground">
                        Complete both resume and job analysis to see comprehensive matching results
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Job Match Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Resume-Job Match Analysis
                        </CardTitle>
                        <CardDescription>
                          How well your resume matches the {industry} position at {industry}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-6xl font-bold text-primary mb-2">
                            {analysisResult.matchScore}%
                          </div>
                          <p className="text-lg font-medium text-primary">Match Score</p>
                          <p className="text-sm text-muted-foreground">
                            {analysisResult.matchScore >= 80 ? "Excellent match! Your resume aligns well with this position." :
                             analysisResult.matchScore >= 60 ? "Good match with room for improvement." :
                             "Significant gaps identified. Focus on the recommendations below."}
                          </p>
                          
                          {/* Debug Information */}
                          <details className="mt-4 text-left">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              🔍 Show Match Calculation Details
                            </summary>
                            <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
                              <div><strong>Resume Keywords Found:</strong> {analysisResult.keywords.length}</div>
                              <div><strong>Job Skills Identified:</strong> {analysisResult.jobSkills.length}</div>
                              <div><strong>Exact Matches:</strong> {analysisResult.matchingSkills.length}</div>
                              <div><strong>Missing Skills:</strong> {analysisResult.missingSkills.length}</div>
                              <div><strong>Match Rate:</strong> {analysisResult.matchingSkills.length > 0 ? 
                                Math.round((analysisResult.matchingSkills.length / analysisResult.jobSkills.length) * 100) : 0}%</div>
                              <div><strong>Calculation Method:</strong> Weighted scoring based on exact and partial matches</div>
                            </div>
                          </details>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Skills Match Analysis</CardTitle>
                        <CardDescription>
                          Detailed breakdown of your skills vs. job requirements
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Match Score Breakdown */}
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <h6 className="font-medium text-blue-900 mb-3">Match Score Breakdown</h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {analysisResult.matchingSkills.length}
                              </div>
                              <div className="text-blue-800">Matching Skills</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {analysisResult.missingSkills.length}
                              </div>
                              <div className="text-blue-800">Missing Skills</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {analysisResult.jobSkills.length}
                              </div>
                              <div className="text-blue-800">Total Job Skills</div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-blue-700 text-center">
                            Match Rate: {analysisResult.matchingSkills.length > 0 ? 
                              Math.round((analysisResult.matchingSkills.length / analysisResult.jobSkills.length) * 100) : 0}%
                          </div>
                        </div>

                        {/* Matching Skills */}
                        <div>
                          <h6 className="font-medium mb-3 text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Skills You Have ({analysisResult.matchingSkills.length})
                          </h6>
                          {analysisResult.matchingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.matchingSkills.map((skill: string, index: number) => (
                                <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                              No matching skills found. This suggests significant gaps between your resume and the job requirements.
                            </div>
                          )}
                        </div>

                        {/* Missing Skills */}
                        <div>
                          <h6 className="font-medium mb-3 text-red-700 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Skills You Need ({analysisResult.missingSkills.length})
                          </h6>
                          {analysisResult.missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.missingSkills.map((skill: string, index: number) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                              Great! You have all the skills mentioned in the job description.
                            </div>
                          )}
                        </div>

                        {/* Job Skills Overview */}
                        <div>
                          <h6 className="font-medium mb-3 text-blue-700 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Key Job Skills (Top 25)
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.jobSkills.map((skill: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Targeted Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Targeted Improvement Recommendations</CardTitle>
                        <CardDescription>
                          Specific actions to improve your resume for this exact position
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analysisResult.recommendations.map((rec: any, index: number) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              rec.priority === "high" ? "bg-red-50 border-red-200" :
                              rec.priority === "medium" ? "bg-yellow-50 border-yellow-200" :
                              "bg-blue-50 border-blue-200"
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  rec.priority === "high" ? "bg-red-500" :
                                  rec.priority === "medium" ? "bg-yellow-500" :
                                  "bg-blue-500"
                                }`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-medium">{rec.title}</h5>
                                    <Badge variant="outline" className="text-xs">
                                      {rec.priority.toUpperCase()} PRIORITY
                                    </Badge>
                                  </div>
                                  <p className="text-sm mb-3">{rec.description}</p>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <h6 className="text-xs font-medium uppercase tracking-wide mb-2">Action Items:</h6>
                                      <ul className="text-sm space-y-1">
                                        {rec.actionItems.map((item: string, itemIndex: number) => (
                                          <li key={itemIndex} className="flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    {rec.examples.length > 0 && (
                                      <div>
                                        <h6 className="text-xs font-medium uppercase tracking-wide mb-2">Examples:</h6>
                                        <div className="flex flex-wrap gap-1">
                                          {rec.examples.map((example: string, exampleIndex: number) => (
                                            <Badge key={exampleIndex} variant="outline" className="text-xs">
                                              {example}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Export Button */}
                    <Card>
                      <CardContent className="text-center py-6">
                        <Button
                          onClick={handleExport}
                          variant="outline"
                          size="lg"
                          className="gap-2"
                        >
                          <Download className="h-5 w-5" />
                          Export Comprehensive Analysis
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Analysis History
                    </CardTitle>
                    <CardDescription>
                      Your previous resume analysis sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showHistory ? (
                      <div className="space-y-4">
                        {/* Add your analysis history components here */}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No analysis history yet. Start analyzing resumes to see your progress!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Industry Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Industry Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <h6 className="font-medium text-blue-900 mb-2">
                    {industry} Industry
                  </h6>
                  <p className="text-sm text-blue-800 mb-2">
                    Key keywords to include in your resume:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {/* Add your industry-specific keywords here */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience Level Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Level-Specific Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <h6 className="font-medium text-green-900 mb-2">
                    {experienceLevel}
                  </h6>
                  <p className="text-sm text-green-800">
                    Focus on: {/* Add your level-specific tips here */}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Resume Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use strong action verbs to start bullet points</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include quantifiable achievements and metrics</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Optimize for ATS with relevant keywords</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Keep it concise (1-2 pages max)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use consistent formatting and fonts</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
