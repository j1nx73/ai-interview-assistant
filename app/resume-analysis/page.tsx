"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  FileText,
  Download,
  Star,
  CheckCircle2,
  Target,
  FileCheck,
  Loader2,
  Trash2,
  History,
  Eye,
  Zap,
  Calendar,
  AlertCircle,
  Info,
  Mic,
  ArrowRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ResumeAnalysis {
  overallScore: number
  sections: {
    contact: { score: number; feedback: string[] }
    summary: { score: number; feedback: string[] }
    experience: { score: number; feedback: string[] }
    education: { score: number; feedback: string[] }
    skills: { score: number; feedback: string[] }
    achievements: { score: number; feedback: string[] }
  }
  suggestions: {
    category: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
    tips: string[]
  }[]
  keywords: string[]
  missingKeywords: string[]
  atsScore: number
  readabilityScore: number
  wordCount: number
  estimatedReadingTime: number
}

interface JobAnalysis {
  jobTitle: string
  company: string
  requirements: string[]
  responsibilities: string[]
  requiredSkills: string[]
  preferredSkills: string[]
  experienceLevel: string
  industry: string
  keywords: string[]
  matchScore: number
  gaps: string[]
  recommendations: {
    category: string
    title: string
    description: string
    priority: "high" | "medium" | "low"
    actionItems: string[]
    examples: string[]
  }[]
}

export default function ResumeAnalysisPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<ResumeAnalysis | null>(null)
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null)
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<any>(null)
  const [selectedIndustry, setSelectedIndustry] = useState("technology")
  const [selectedLevel, setSelectedLevel] = useState("entry")
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isJobAnalyzing, setIsJobAnalyzing] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [activeTab, setActiveTab] = useState("upload")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Load analysis history on component mount
  useEffect(() => {
    loadAnalysisHistory()
    checkDatabaseHealth()
  }, [])

  const checkDatabaseHealth = async () => {
    try {
      console.log("Checking database health...")
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log("User not authenticated, skipping database health check")
        return
      }
      
      // Test if the resume_analysis table exists and is accessible
      const { data, error } = await supabase
        .from("resume_analysis")
        .select("id")
        .limit(1)
      
      if (error) {
        console.error("Database health check failed:", error)
        console.error("This might mean the table doesn't exist or RLS policies are not set up correctly")
        
        if (error.code === '42P01') {
          alert("Database setup issue: The resume_analysis table doesn't exist. Please run the database setup scripts.")
        } else if (error.code === '42501') {
          alert("Permission issue: You don't have access to the resume_analysis table. Please check your authentication.")
        } else {
          alert(`Database error: ${error.message}. Please check your connection and try again.`)
        }
      } else {
        console.log("Database health check passed - table is accessible")
      }
    } catch (error: any) {
      console.error("Database health check error:", error)
    }
  }

  const industries = [
    { value: "technology", label: "Technology", keywords: ["software", "development", "programming", "agile", "scrum"] },
    { value: "finance", label: "Finance", keywords: ["financial", "analysis", "budgeting", "forecasting", "risk"] },
    { value: "healthcare", label: "Healthcare", keywords: ["patient", "clinical", "medical", "healthcare", "treatment"] },
    { value: "marketing", label: "Marketing", keywords: ["campaign", "branding", "social media", "analytics", "growth"] },
    { value: "sales", label: "Sales", keywords: ["revenue", "clients", "negotiation", "pipeline", "targets"] },
    { value: "education", label: "Education", keywords: ["teaching", "curriculum", "students", "learning", "assessment"] },
    { value: "consulting", label: "Consulting", keywords: ["strategy", "clients", "solutions", "implementation", "stakeholders"] },
  ]

  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)", focus: "education, internships, basic skills" },
    { value: "mid", label: "Mid Level (3-7 years)", focus: "project leadership, technical expertise, results" },
    { value: "senior", label: "Senior Level (8+ years)", focus: "strategic leadership, team management, business impact" },
  ]

  const performComprehensiveAnalysis = (
    resumeAnalysis: ResumeAnalysis, 
    jobDescription: string, 
    jobTitle: string, 
    companyName: string, 
    industry: string, 
    level: string
  ) => {
    console.log("🔍 Starting comprehensive analysis...")
    console.log("📄 Resume keywords:", resumeAnalysis.keywords)
    console.log("💼 Job description length:", jobDescription.length)
    console.log("🏭 Industry:", industry)
    
    // Extract job requirements and skills more intelligently
    const jobWords = jobDescription.toLowerCase().split(/\s+/)
    
    // Industry-specific keywords from the job
    const industryKeywords = industries.find(i => i.value === industry)?.keywords || []
    console.log("🏭 Industry keywords:", industryKeywords)
    
    // Extract meaningful skills from job description using better patterns
    const skillPatterns = [
      // Technical skills
      /(?:javascript|js|react|angular|vue|node\.js|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|typescript|html|css|sql|nosql)/gi,
      // Tools and platforms
      /(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|jira|confluence|slack|agile|scrum|kanban)/gi,
      // Databases
      /(?:mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|oracle|sql server)/gi,
      // Frameworks and libraries
      /(?:express|django|flask|spring|hibernate|laravel|rails|asp\.net|dotnet|bootstrap|tailwind|material-ui)/gi,
      // Data and analytics
      /(?:machine learning|ml|ai|data science|analytics|statistics|excel|tableau|power bi|pandas|numpy|scikit-learn)/gi,
      // Soft skills
      /(?:leadership|communication|teamwork|problem solving|collaboration|project management|agile|scrum|kanban)/gi,
      // Business skills
      /(?:strategy|planning|budgeting|forecasting|risk management|stakeholder management|client relations)/gi
    ]
    
    const extractedSkills: string[] = []
    skillPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern)
      if (matches) {
        extractedSkills.push(...matches.map(match => match.toLowerCase()))
      }
    })
    
    // Add industry keywords
    extractedSkills.push(...industryKeywords)
    
    // Filter out common words and duplicates
    const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'will', 'must', 'should', 'can', 'will', 'may', 'might', 'could', 'would', 'shall', 'do', 'does', 'did', 'done', 'go', 'goes', 'going', 'gone', 'went', 'get', 'gets', 'getting', 'got', 'gotten', 'make', 'makes', 'making', 'made', 'know', 'knows', 'knowing', 'knew', 'known', 'see', 'sees', 'seeing', 'saw', 'seen', 'come', 'comes', 'coming', 'came', 'think', 'thinks', 'thinking', 'thought', 'look', 'looks', 'looking', 'looked', 'want', 'wants', 'wanting', 'wanted', 'give', 'gives', 'giving', 'gave', 'given', 'use', 'uses', 'using', 'used', 'find', 'finds', 'finding', 'found', 'tell', 'tells', 'telling', 'told', 'ask', 'asks', 'asking', 'asked', 'work', 'works', 'working', 'worked', 'seem', 'seems', 'seeming', 'seemed', 'feel', 'feels', 'feeling', 'felt', 'try', 'tries', 'trying', 'tried', 'leave', 'leaves', 'leaving', 'left', 'call', 'calls', 'calling', 'called']
    
    const jobSkills = [...new Set(extractedSkills.filter(word => 
      word.length > 2 && 
      !commonWords.includes(word) &&
      !/^\d+$/.test(word) // Not just numbers
    ))]
    
    console.log("🔧 Extracted job skills:", jobSkills)
    console.log("📊 Total job skills found:", jobSkills.length)
    
    // Calculate match scores more accurately
    const resumeSkills = resumeAnalysis.keywords
    const matchingSkills = resumeSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase() === jobSkill.toLowerCase()
      )
    )
    
    const missingSkills = jobSkills.filter(jobSkill => 
      !resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(resumeSkill.toLowerCase()) ||
        resumeSkill.toLowerCase() === jobSkill.toLowerCase()
      )
    )
    
    console.log("✅ Matching skills:", matchingSkills)
    console.log("❌ Missing skills:", missingSkills)
    console.log("📈 Match rate:", jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length * 100).toFixed(1) + '%' : 'N/A')
    
    // Calculate match score with better logic
    let matchScore = 0
    if (jobSkills.length > 0) {
      // Weight matching skills more heavily
      const exactMatches = matchingSkills.length
      const partialMatches = resumeSkills.filter(skill => 
        jobSkills.some(jobSkill => 
          skill.toLowerCase().includes(jobSkill.toLowerCase()) || 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      ).length
      
      // Calculate score based on both exact and partial matches
      matchScore = Math.round(((exactMatches * 0.7 + partialMatches * 0.3) / jobSkills.length) * 100)
    }
    
    // Ensure score is within bounds
    matchScore = Math.max(0, Math.min(100, matchScore))
    
    console.log("🎯 Final match score:", matchScore + '%')
    
    // Generate enhanced targeted recommendations
    const recommendations = [
      {
        category: "Skills Optimization",
        title: "Highlight Your Matching Skills",
        description: `You have ${matchingSkills.length} skills that directly match this job. Make sure they're prominently featured.`,
        priority: "high" as const,
        actionItems: [
          "Move matching skills to the top of your skills section",
          "Add specific examples of how you used these skills in your experience",
          "Include relevant projects that demonstrate these skills",
          "Use the exact terminology from the job description",
          "Quantify your experience with these skills"
        ],
        examples: matchingSkills.slice(0, 5)
      },
      {
        category: "Skills Development",
        title: "Address Critical Skill Gaps",
        description: `Focus on developing ${missingSkills.length} key skills that are required for this position.`,
        priority: "high" as const,
        actionItems: [
          "Prioritize learning the top 3-5 missing skills",
          "Take online courses or certifications for technical skills",
          "Work on personal projects using these technologies",
          "Highlight transferable skills that relate to missing requirements",
          "Consider bootcamps or workshops for intensive learning"
        ],
        examples: missingSkills.slice(0, 5)
      },
      {
        category: "Content Enhancement",
        title: "Optimize Resume Content",
        description: "Improve your resume's impact and ATS compatibility for this specific role.",
        priority: "medium" as const,
        actionItems: [
          "Rewrite bullet points to include relevant keywords naturally",
          "Use industry-standard terminology throughout",
          "Ensure proper formatting and structure for ATS systems",
          "Add quantifiable achievements related to required skills",
          "Tailor your professional summary to this specific role"
        ],
        examples: []
      },
      {
        category: "Experience Alignment",
        title: "Align Experience with Job Requirements",
        description: "Make your experience descriptions more relevant to this specific position.",
        priority: "medium" as const,
        actionItems: [
          "Emphasize projects and experiences that use required skills",
          "Add context about team size and project scope",
          "Include metrics and results that demonstrate impact",
          "Highlight leadership and collaboration experiences",
          "Show progression and growth in relevant areas"
        ],
        examples: []
      },
      {
        category: "Strategic Positioning",
        title: "Position Yourself for Success",
        description: "Take strategic steps to improve your candidacy for this role.",
        priority: "low" as const,
        actionItems: [
          "Network with professionals at the target company",
          "Research the company's culture and values",
          "Prepare specific examples of relevant achievements",
          "Consider additional certifications or training",
          "Update your LinkedIn profile to match job requirements"
        ],
        examples: []
      }
    ]
    
    return {
      resumeAnalysis,
      jobTitle,
      companyName,
      industry,
      level,
      matchScore,
      matchingSkills,
      missingSkills,
      recommendations,
      jobSkills: jobSkills.slice(0, 25), // Top 25 job skills
      analysisDate: new Date().toISOString()
    }
  }

  const performResumeAnalysis = (text: string, industry: string, level: string): ResumeAnalysis => {
    console.log("📄 Starting resume analysis...")
    console.log("📊 Text length:", text.length, "characters")
    console.log("🏭 Target industry:", industry)
    console.log("📈 Experience level:", level)
    
    const words = text.toLowerCase().split(/\s+/)
    const wordCount = words.length
    const estimatedReadingTime = Math.ceil(wordCount / 200) // 200 words per minute

    // Industry-specific keywords
    const industryKeywords = industries.find(i => i.value === industry)?.keywords || []
    const foundKeywords = industryKeywords.filter(keyword => 
      words.some(word => word.toLowerCase().includes(keyword.toLowerCase()))
    )
    const missingKeywords = industryKeywords.filter(keyword => 
      !words.some(word => word.toLowerCase().includes(keyword.toLowerCase()))
    )
    
    // Extract additional technical and professional keywords from resume
    const technicalKeywords = extractTechnicalKeywords(text)
    const professionalKeywords = extractProfessionalKeywords(text)
    
    // Combine all found keywords
    const allKeywords = [...new Set([...foundKeywords, ...technicalKeywords, ...professionalKeywords])]
    
    console.log("🏭 Industry keywords found:", foundKeywords)
    console.log("🔧 Technical keywords:", technicalKeywords)
    console.log("💼 Professional keywords:", professionalKeywords)
    console.log("📊 Total keywords:", allKeywords.length)

    // Section analysis
    const sections = {
      contact: analyzeContactSection(text),
      summary: analyzeSummarySection(text),
      experience: analyzeExperienceSection(text),
      education: analyzeEducationSection(text),
      skills: analyzeSkillsSection(text),
      achievements: analyzeAchievementsSection(text),
    }

    // Calculate overall score
    const sectionScores = Object.values(sections).map(s => s.score)
    const overallScore = Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length)

    // ATS score (Applicant Tracking System compatibility)
    const atsScore = calculateATSScore(text, sections)

    // Readability score
    const readabilityScore = calculateReadabilityScore(text)

    // Generate suggestions
    const suggestions = generateSuggestions(sections, industry, level, foundKeywords, missingKeywords)

    // Note: Database saving is handled separately in the UI to avoid blocking the analysis

    return {
      overallScore,
      sections,
      suggestions,
      keywords: allKeywords,
      missingKeywords,
      atsScore,
      readabilityScore,
      wordCount,
      estimatedReadingTime,
    }
  }

  const saveAnalysisToDatabase = async (analysis: ResumeAnalysis, industry: string, level: string) => {
    try {
      console.log("Starting to save analysis to database...")
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("Authentication error:", authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      
      if (!user) {
        console.error("No user found")
        throw new Error("User not authenticated. Please log in again.")
      }
      
      console.log("User authenticated:", user.id)
      console.log("Analysis data:", { industry, level, overallScore: analysis.overallScore })
      
      const { error } = await supabase.from("resume_analysis").insert({
        user_id: user.id,
        industry: industry,
        level: level,
        analysis: analysis,
        match_score: analysis.overallScore,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Database insert error:", error)
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Database error: ${error.message}`)
      } else {
        console.log("Analysis saved successfully!")
        // Load updated history
        loadAnalysisHistory()
      }
    } catch (error: any) {
      console.error("Error saving analysis:", error)
      console.error("Error stack:", error.stack)
      console.error("Error message:", error.message)
      
      // Show user-friendly error message
      alert(`Failed to save analysis: ${error.message || 'Unknown error occurred'}`)
      
      // Re-throw to be handled by caller
      throw error
    }
  }

  const loadAnalysisHistory = async () => {
    try {
      console.log("Loading analysis history...")
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("Authentication error in loadHistory:", authError)
        return
      }
      
      if (!user) {
        console.log("No user found, skipping history load")
        return
      }
      
      console.log("Loading history for user:", user.id)
      
      const { data: records, error } = await supabase
        .from("resume_analysis")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error loading history:", error)
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return
      }

      console.log("History loaded successfully:", records?.length || 0, "records")
      setAnalysisHistory(records || [])
    } catch (error: any) {
      console.error("Error loading history:", error)
      console.error("Error stack:", error.stack)
    }
  }

  const analyzeContactSection = (text: string) => {
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)
    const hasPhone = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/.test(text)
    const hasLocation = /(city|state|country|address|location)/i.test(text)
    const hasLinkedIn = /linkedin\.com/i.test(text)

    const score = Math.round((hasEmail ? 25 : 0) + (hasPhone ? 25 : 0) + (hasLocation ? 25 : 0) + (hasLinkedIn ? 25 : 0))
    
    const feedback = []
    if (!hasEmail) feedback.push("Missing email address")
    if (!hasPhone) feedback.push("Missing phone number")
    if (!hasLocation) feedback.push("Missing location information")
    if (!hasLinkedIn) feedback.push("Consider adding LinkedIn profile")

    return { score, feedback }
  }

  const analyzeSummarySection = (text: string) => {
    const hasSummary = /(summary|objective|profile|about)/i.test(text)
    const summaryLength = text.match(/(summary|objective|profile|about)[\s\S]*?(experience|education|skills)/i)
    const hasKeywords = /(experienced|skilled|passionate|dedicated|results-oriented)/i.test(text)

    let score = 0
    const feedback = []

    if (hasSummary) score += 40
    else feedback.push("Missing professional summary section")

    if (summaryLength && summaryLength[0].length > 50) score += 30
    else if (hasSummary) feedback.push("Summary is too short - aim for 2-3 sentences")

    if (hasKeywords) score += 30
    else if (hasSummary) feedback.push("Add action words and professional keywords")

    return { score, feedback }
  }

  const analyzeExperienceSection = (text: string) => {
    const hasExperience = /(experience|work history|employment|professional background)/i.test(text)
    const hasDates = /\d{4}/.test(text)
    const hasActionVerbs = /(developed|implemented|managed|led|created|improved|increased|decreased)/i.test(text)
    const hasMetrics = /(\d+%|\$\d+|\d+ people|\d+ projects)/.test(text)

    let score = 0
    const feedback = []

    if (hasExperience) score += 30
    else feedback.push("Missing work experience section")

    if (hasDates) score += 20
    else feedback.push("Missing dates for experience entries")

    if (hasActionVerbs) score += 25
    else feedback.push("Use strong action verbs to start bullet points")

    if (hasMetrics) score += 25
    else feedback.push("Include quantifiable achievements and metrics")

    return { score, feedback }
  }

  const analyzeEducationSection = (text: string) => {
    const hasEducation = /(education|academic|degree|university|college|school)/i.test(text)
    const hasDegree = /(bachelor|master|phd|associate|diploma|certificate)/i.test(text)
    const hasGPA = /(gpa|grade point average)/i.test(text)
    const hasRelevantCourses = /(course|curriculum|studied|major|minor)/i.test(text)

    let score = 0
    const feedback = []

    if (hasEducation) score += 30
    else feedback.push("Missing education section")

    if (hasDegree) score += 30
    else feedback.push("Specify degree type and field of study")

    if (hasGPA && parseFloat(text.match(/gpa[:\s]*(\d+\.\d+)/i)?.[1] || "0") >= 3.0) score += 20
    else feedback.push("Include GPA if it's 3.0 or higher")

    if (hasRelevantCourses) score += 20
    else feedback.push("List relevant coursework for entry-level positions")

    return { score, feedback }
  }

  const analyzeSkillsSection = (text: string) => {
    const hasSkills = /(skills|competencies|technologies|tools|languages)/i.test(text)
    const hasTechnicalSkills = /(programming|software|database|framework|platform)/i.test(text)
    const hasSoftSkills = /(leadership|communication|teamwork|problem-solving|collaboration)/i.test(text)
    const hasSkillLevels = /(beginner|intermediate|advanced|expert|proficient)/i.test(text)

    let score = 0
    const feedback = []

    if (hasSkills) score += 30
    else feedback.push("Missing skills section")

    if (hasTechnicalSkills) score += 25
    else feedback.push("Include technical skills relevant to your field")

    if (hasSoftSkills) score += 25
    else feedback.push("Include soft skills and interpersonal abilities")

    if (hasSkillLevels) score += 20
    else feedback.push("Consider indicating skill proficiency levels")

    return { score, feedback }
  }

  const analyzeAchievementsSection = (text: string) => {
    const hasAchievements = /(achievements|awards|recognition|honors|certifications)/i.test(text)
    const hasQuantifiableResults = /(\d+%|\$\d+|\d+ awards|\d+ certifications)/.test(text)
    const hasIndustryRecognition = /(award|recognition|honor|certification|accreditation)/i.test(text)

    let score = 0
    const feedback = []

    if (hasAchievements) score += 40
    else feedback.push("Consider adding achievements or awards section")

    if (hasQuantifiableResults) score += 30
    else feedback.push("Include quantifiable achievements and results")

    if (hasIndustryRecognition) score += 30
    else feedback.push("Highlight industry certifications and recognitions")

    return { score, feedback }
  }

  const calculateATSScore = (text: string, sections: any) => {
    let score = 0
    
    // Check for common ATS-friendly elements
    if (sections.contact.score > 80) score += 20
    if (sections.summary.score > 70) score += 20
    if (sections.experience.score > 70) score += 20
    if (sections.skills.score > 70) score += 20
    if (sections.education.score > 70) score += 20

    // Check for keyword optimization
    const keywordDensity = sections.skills.score > 80 ? 20 : 10
    score += keywordDensity

    return Math.min(100, score)
  }

  const calculateReadabilityScore = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length

    // Flesch Reading Ease formula
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    
    return Math.max(0, Math.min(100, Math.round(fleschScore)))
  }

  const countSyllables = (word: string) => {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
  }

  const extractTechnicalKeywords = (text: string): string[] => {
    const technicalPatterns = [
      // Programming languages
      /(?:javascript|js|react|angular|vue|node\.js|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|typescript|html|css|scala|r|matlab|perl|shell|bash|powershell)/gi,
      // Databases
      /(?:sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|oracle|sql server|mariadb|cassandra|neo4j)/gi,
      // Cloud and DevOps
      /(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|bitbucket|jira|confluence|slack|agile|scrum|kanban|ci\/cd)/gi,
      // Data science
      /(?:machine learning|ml|ai|data science|analytics|statistics|pandas|numpy|scikit-learn|tensorflow|pytorch|spark|hadoop)/gi,
      // Frameworks
      /(?:express|django|flask|spring|hibernate|laravel|rails|asp\.net|dotnet|bootstrap|tailwind|material-ui)/gi,
      // Tools
      /(?:excel|tableau|power bi|figma|sketch|adobe|photoshop|illustrator|selenium|cypress|jest|mocha)/gi
    ]
    
    const keywords: string[] = []
    technicalPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        keywords.push(...matches.map(match => match.toLowerCase()))
      }
    })
    
    return [...new Set(keywords)]
  }

  const extractProfessionalKeywords = (text: string): string[] => {
    const professionalPatterns = [
      // Leadership and management
      /(?:leadership|management|supervision|mentoring|coaching|team building|strategic planning|project management)/gi,
      // Communication
      /(?:communication|presentation|public speaking|writing|documentation|training|facilitation|negotiation)/gi,
      // Problem solving
      /(?:problem solving|analytical|critical thinking|research|investigation|troubleshooting|optimization)/gi,
      // Business skills
      /(?:strategy|planning|budgeting|forecasting|risk management|stakeholder management|client relations|business development)/gi,
      // Collaboration
      /(?:teamwork|collaboration|cross-functional|interdisciplinary|partnership|coordination|integration)/gi,
      // Results and metrics
      /(?:kpi|metrics|performance|efficiency|productivity|quality|standards|compliance|audit)/gi
    ]
    
    const keywords: string[] = []
    professionalPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        keywords.push(...matches.map(match => match.toLowerCase()))
      }
    })
    
    return [...new Set(keywords)]
  }

  const generateSuggestions = (sections: any, industry: string, level: string, foundKeywords: string[], missingKeywords: string[]) => {
    const suggestions = []

    // High priority suggestions
    if (sections.contact.score < 70) {
      suggestions.push({
        category: "Contact Information",
        title: "Improve Contact Section",
        description: "Your contact information is incomplete, which may prevent recruiters from reaching you.",
        priority: "high" as const,
        tips: [
          "Ensure email address is professional and current",
          "Include a professional phone number",
          "Add your city and state for location-based searches",
          "Include LinkedIn profile URL",
          "Consider adding a portfolio website if relevant"
        ]
      })
    }

    if (sections.experience.score < 70) {
      suggestions.push({
        category: "Work Experience",
        title: "Enhance Experience Descriptions",
        description: "Your work experience section needs improvement to better showcase your achievements.",
        priority: "high" as const,
        tips: [
          "Start bullet points with strong action verbs",
          "Include quantifiable results and metrics",
          "Focus on achievements rather than just responsibilities",
          "Use industry-specific terminology",
          "Highlight leadership and project management experience"
        ]
      })
    }

    if (missingKeywords.length > 0) {
      suggestions.push({
        category: "Keyword Optimization",
        title: "Add Industry Keywords",
        description: `Include more industry-specific keywords to improve ATS compatibility and relevance for ${industry} positions.`,
        priority: "high" as const,
        tips: [
          `Add keywords: ${missingKeywords.slice(0, 5).join(", ")}`,
          "Incorporate keywords naturally throughout your resume",
          "Use variations of important terms",
          "Include both technical and soft skill keywords",
          "Research job descriptions for additional relevant terms"
        ]
      })
    }

    // Medium priority suggestions
    if (sections.summary.score < 70) {
      suggestions.push({
        category: "Professional Summary",
        title: "Strengthen Professional Summary",
        description: "Your summary section could better highlight your value proposition and career objectives.",
        priority: "medium" as const,
        tips: [
          "Write 2-3 compelling sentences",
          "Include your years of experience",
          "Mention key skills and achievements",
          "State your career objective clearly",
          "Use industry-specific language"
        ]
      })
    }

    if (sections.skills.score < 70) {
      suggestions.push({
        category: "Skills Section",
        title: "Organize Skills Effectively",
        description: "Your skills section could be better organized to highlight your capabilities.",
        priority: "medium" as const,
        tips: [
          "Group skills by category (Technical, Soft Skills, Tools)",
          "Include proficiency levels where appropriate",
          "Add industry-specific technical skills",
          "Highlight emerging technologies and trends",
          "Ensure skills match job requirements"
        ]
      })
    }

    // Low priority suggestions
    if (sections.achievements.score < 70) {
      suggestions.push({
        category: "Achievements",
        title: "Highlight Accomplishments",
        description: "Adding an achievements section can make your resume stand out from competitors.",
        priority: "low" as const,
        tips: [
          "Include awards and recognitions",
          "List certifications and licenses",
          "Highlight quantifiable achievements",
          "Mention industry-specific accomplishments",
          "Add relevant volunteer work or projects"
        ]
      })
    }

    return suggestions
  }

  const performJobAnalysis = (jobDescription: string, jobTitle: string, company: string, industry: string, level: string): JobAnalysis => {
    console.log("💼 Starting job analysis...")
    console.log("📋 Job title:", jobTitle)
    console.log("🏢 Company:", company)
    console.log("🏭 Industry:", industry)
    console.log("📈 Level:", level)
    console.log("📄 Job description length:", jobDescription.length, "characters")
    
    const text = jobDescription.toLowerCase()
    const words = text.split(/\s+/)
    
    // Extract required skills from job description using improved patterns
    const requiredSkills = extractSkillsFromJobDescription(text, "required", "must have", "requirements", "qualifications", "experience")
    const preferredSkills = extractSkillsFromJobDescription(text, "preferred", "nice to have", "bonus", "plus", "desired", "helpful")
    
    console.log("🔧 Required skills extracted:", requiredSkills)
    console.log("⭐ Preferred skills extracted:", preferredSkills)
    
    // Extract responsibilities and requirements
    const responsibilities = extractResponsibilities(text)
    const requirements = extractRequirements(text)
    
    // Calculate match score based on resume analysis with better logic
    const matchScore = calculateJobMatchScore(requiredSkills, preferredSkills, analysisResults)
    
    // Identify skill gaps
    const gaps = identifySkillGaps(requiredSkills, preferredSkills, analysisResults)
    
    console.log("❌ Skill gaps identified:", gaps)
    console.log("🎯 Match score calculated:", matchScore + '%')
    
    // Generate enhanced targeted recommendations
    const recommendations = generateJobSpecificRecommendations(requiredSkills, preferredSkills, gaps, level, industry, jobTitle)
    
    return {
      jobTitle,
      company: company || "Unknown Company",
      requirements,
      responsibilities,
      requiredSkills,
      preferredSkills,
      experienceLevel: level,
      industry,
      keywords: [...requiredSkills, ...preferredSkills],
      matchScore,
      gaps,
      recommendations,
    }
  }

  const extractSkillsFromJobDescription = (text: string, ...keywords: string[]): string[] => {
    console.log("🔍 Extracting skills from job description...")
    console.log("🔑 Keywords to search for:", keywords)
    
    const skills: string[] = []
    
    // Enhanced skill patterns for better extraction
    const skillPatterns = [
      // Programming languages
      /(?:javascript|js|react|angular|vue|node\.js|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|typescript|html|css|scala|r|matlab|perl|shell|bash|powershell)/gi,
      // Databases and data
      /(?:sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|oracle|sql server|mariadb|cassandra|neo4j|influxdb|timescaledb)/gi,
      // Cloud and DevOps
      /(?:aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|bitbucket|jira|confluence|slack|teams|agile|scrum|kanban|ci\/cd|pipeline)/gi,
      // Data science and analytics
      /(?:machine learning|ml|ai|data science|analytics|statistics|excel|tableau|power bi|pandas|numpy|scikit-learn|tensorflow|pytorch|keras|spark|hadoop|hive|pig)/gi,
      // Frameworks and libraries
      /(?:express|django|flask|spring|hibernate|laravel|rails|asp\.net|dotnet|bootstrap|tailwind|material-ui|ant design|semantic ui|jquery|lodash|moment|axios)/gi,
      // Soft skills and business
      /(?:leadership|communication|teamwork|problem solving|collaboration|project management|agile|scrum|kanban|strategy|planning|budgeting|forecasting|risk management|stakeholder management|client relations|negotiation|presentation|mentoring|coaching)/gi,
      // Design and UX
      /(?:ui\/ux|user experience|user interface|design thinking|wireframing|prototyping|figma|sketch|adobe|photoshop|illustrator|invision|zeplin|framer)/gi,
      // Testing and quality
      /(?:testing|qa|quality assurance|unit testing|integration testing|end-to-end testing|selenium|cypress|jest|mocha|junit|pytest|testng|manual testing|automated testing)/gi
    ]
    
    // Extract skills using patterns
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        skills.push(...matches.map(match => match.toLowerCase()))
      }
    })
    
    console.log("🔧 Skills found using patterns:", skills)
    
    // Look for skills mentioned near requirement keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`(?:${keyword}[\\s\\S]*?)([a-zA-Z\\s\\+\\#\\.]+)`, 'gi')
      const matches = text.match(regex)
      if (matches) {
        matches.forEach(match => {
          const skillMatch = match.match(/([a-zA-Z\s\+\#\.]+)$/)
          if (skillMatch) {
            const skill = skillMatch[1].trim().toLowerCase()
            if (skill.length > 2 && skill.length < 50) {
              skills.push(skill)
            }
          }
        })
      }
    })
    
    console.log("🔑 Skills found near keywords:", skills)
    
    // Remove duplicates, filter out common words, and return
    const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'will', 'must', 'should', 'can', 'may', 'might', 'could', 'would', 'shall', 'years', 'experience', 'plus', 'minimum', 'required', 'preferred', 'desired', 'helpful', 'bonus', 'nice', 'have', 'good', 'strong', 'excellent', 'outstanding', 'proven', 'demonstrated', 'ability', 'skills', 'knowledge', 'understanding', 'familiarity', 'proficiency', 'expertise', 'mastery', 'competency', 'capability', 'capacity', 'talent', 'gift', 'aptitude', 'knack', 'flair', 'genius', 'brilliance', 'intelligence', 'cleverness', 'shrewdness', 'astuteness', 'acumen', 'perspicacity', 'discernment', 'insight', 'perception', 'awareness', 'consciousness', 'recognition', 'realization', 'appreciation', 'comprehension', 'grasp', 'command', 'mastery', 'control', 'authority', 'power', 'influence', 'sway', 'leverage', 'clout', 'pull', 'weight', 'importance', 'significance', 'relevance', 'pertinence', 'applicability', 'suitability', 'appropriateness', 'fitness', 'adequacy', 'sufficiency', 'satisfactoriness', 'acceptability', 'satisfaction', 'fulfillment', 'completion', 'achievement', 'accomplishment', 'success', 'victory', 'triumph', 'conquest', 'overcoming', 'surmounting', 'prevailing', 'succeeding', 'prospering', 'thriving', 'flourishing', 'blooming', 'blossoming', 'growing', 'developing', 'advancing', 'progressing', 'improving', 'enhancing', 'upgrading', 'refining', 'perfecting', 'polishing', 'honing', 'sharpening', 'fine-tuning', 'calibrating', 'adjusting', 'modifying', 'altering', 'changing', 'transforming', 'converting', 'adapting', 'adjusting', 'accommodating', 'fitting', 'suiting', 'matching', 'corresponding', 'aligning', 'coordinating', 'harmonizing', 'integrating', 'unifying', 'consolidating', 'combining', 'merging', 'joining', 'connecting', 'linking', 'tying', 'binding', 'attaching', 'affixing', 'fastening', 'securing', 'fixing', 'establishing', 'setting', 'placing', 'positioning', 'locating', 'situating', 'installing', 'implementing', 'executing', 'performing', 'carrying', 'conducting', 'managing', 'overseeing', 'supervising', 'directing', 'guiding', 'leading', 'steering', 'navigating', 'piloting', 'driving', 'operating', 'running', 'functioning', 'working', 'operating', 'functioning', 'performing', 'executing', 'implementing', 'carrying', 'conducting', 'managing', 'overseeing', 'supervising', 'directing', 'guiding', 'leading', 'steering', 'navigating', 'piloting', 'driving', 'operating', 'running', 'functioning', 'working']
    
    const filteredSkills = [...new Set(skills.filter(skill => 
      skill.length > 2 && 
      skill.length < 50 &&
      !commonWords.includes(skill) &&
      !/^\d+$/.test(skill) && // Not just numbers
      !/^[a-z]\s+[a-z]$/i.test(skill) // Not just two single letters
    ))]
    
    console.log("✅ Final filtered skills:", filteredSkills)
    console.log("📊 Total skills extracted:", filteredSkills.length)
    
    return filteredSkills
  }

  const extractResponsibilities = (text: string): string[] => {
    const responsibilities: string[] = []
    const lines = text.split('\n')
    
    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        const cleanLine = line.replace(/^[•\-*]\s*/, '').trim()
        if (cleanLine.length > 10) {
          responsibilities.push(cleanLine)
        }
      }
    })
    
    return responsibilities.slice(0, 10) // Return first 10 responsibilities
  }

  const extractRequirements = (text: string): string[] => {
    const requirements: string[] = []
    const lines = text.split('\n')
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('requirement') || line.toLowerCase().includes('qualification') || line.toLowerCase().includes('experience')) {
        const cleanLine = line.replace(/^[•\-*]\s*/, '').trim()
        if (cleanLine.length > 10) {
          requirements.push(cleanLine)
        }
      }
    })
    
    return requirements.slice(0, 8) // Return first 8 requirements
  }

  const calculateJobMatchScore = (requiredSkills: string[], preferredSkills: string[], resumeAnalysis: ResumeAnalysis | null): number => {
    if (!resumeAnalysis) return 0
    
    const resumeSkills = resumeAnalysis.keywords
    let score = 0
    
    // Calculate required skills match (70% weight)
    const requiredMatches = requiredSkills.filter(skill => 
      resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(resumeSkill.toLowerCase()) ||
        resumeSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length
    score += (requiredMatches / Math.max(requiredSkills.length, 1)) * 70
    
    // Calculate preferred skills match (30% weight)
    const preferredMatches = preferredSkills.filter(skill => 
      resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(resumeSkill.toLowerCase()) ||
        resumeSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length
    score += (preferredMatches / Math.max(preferredSkills.length, 1)) * 30
    
    // Bonus points for having more skills than required (up to 10 points)
    const totalResumeSkills = resumeSkills.length
    const totalJobSkills = requiredSkills.length + preferredSkills.length
    if (totalResumeSkills > totalJobSkills) {
      const bonus = Math.min(10, Math.round((totalResumeSkills - totalJobSkills) / 2))
      score += bonus
    }
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  const identifySkillGaps = (requiredSkills: string[], preferredSkills: string[], resumeAnalysis: ResumeAnalysis | null): string[] => {
    if (!resumeAnalysis) return [...requiredSkills, ...preferredSkills]
    
    const resumeSkills = resumeAnalysis.keywords
    const gaps: string[] = []
    
    // Check required skills gaps (higher priority)
    requiredSkills.forEach(skill => {
      if (!resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(resumeSkill.toLowerCase()) ||
        resumeSkill.toLowerCase() === skill.toLowerCase()
      )) {
        gaps.push(skill)
      }
    })
    
    // Check preferred skills gaps (lower priority)
    preferredSkills.forEach(skill => {
      if (!resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(resumeSkill.toLowerCase()) ||
        resumeSkill.toLowerCase() === skill.toLowerCase()
      )) {
        gaps.push(skill)
      }
    })
    
    // Sort gaps by priority (required skills first, then preferred)
    const requiredGaps = gaps.filter(gap => requiredSkills.includes(gap))
    const preferredGaps = gaps.filter(gap => preferredSkills.includes(gap))
    
    return [...new Set([...requiredGaps, ...preferredGaps])] // Remove duplicates and maintain priority order
  }

  const generateJobSpecificRecommendations = (requiredSkills: string[], preferredSkills: string[], gaps: string[], level: string, industry: string, jobTitle: string) => {
    const recommendations = []
    
    // High priority: Missing required skills
    if (gaps.length > 0) {
      recommendations.push({
        category: "Critical Skills Gap",
        title: "Develop Missing Required Skills",
        description: `You're missing ${gaps.length} critical skills required for this ${jobTitle} position. These are non-negotiable requirements.`,
        priority: "high" as const,
        actionItems: [
          "Prioritize learning the top 3-5 missing skills based on job requirements",
          "Take online courses or certifications for technical skills",
          "Work on personal projects using these technologies to build portfolio",
          "Add relevant skills to your resume once acquired",
          "Consider bootcamps or workshops for intensive learning",
          "Network with professionals who have these skills"
        ],
        examples: gaps.slice(0, 5)
      })
    }
    
    // High priority: Skill optimization
    if (requiredSkills.length > 0) {
      recommendations.push({
        category: "Skills Optimization",
        title: "Optimize Your Skills Section",
        description: "Ensure your skills section highlights the most relevant capabilities for this specific position.",
        priority: "high" as const,
        actionItems: [
          "Move relevant skills to the top of your skills section",
          "Add proficiency levels for technical skills (Beginner/Intermediate/Advanced)",
          "Group skills by category (Technical, Tools, Soft Skills, Industry-Specific)",
          "Include industry-specific terminology and buzzwords",
          "Remove outdated or irrelevant skills to focus on what matters",
          "Use the exact terminology from the job description"
        ],
        examples: requiredSkills.slice(0, 5)
      })
    }
    
    // Medium priority: Experience alignment
    recommendations.push({
      category: "Experience Alignment",
      title: "Align Experience with Job Requirements",
      description: "Tailor your experience descriptions to emphasize skills and achievements relevant to this specific role.",
      priority: "medium" as const,
      actionItems: [
        "Rewrite bullet points to include relevant keywords naturally",
        "Quantify achievements with specific metrics and results",
        "Emphasize transferable skills and experiences that relate to the job",
        "Add relevant projects or volunteer work that demonstrates required skills",
        "Update your professional summary to match the job requirements",
        "Highlight leadership and collaboration experiences"
      ],
      examples: []
    })
    
    // Medium priority: Content enhancement
    recommendations.push({
      category: "Content Enhancement",
      title: "Enhance Resume Content and Impact",
      description: "Improve the overall quality and impact of your resume content for this position.",
      priority: "medium" as const,
      actionItems: [
        "Ensure all bullet points start with strong action verbs",
        "Add context about team size, project scope, and business impact",
        "Include industry-specific achievements and recognitions",
        "Highlight any certifications or training relevant to the role",
        "Show progression and growth in relevant areas",
        "Use industry-standard formatting and structure"
      ],
      examples: []
    })
    
    // Low priority: Strategic positioning
    recommendations.push({
      category: "Strategic Positioning",
      title: "Position Yourself for Success",
      description: "Take strategic steps to improve your candidacy and stand out for this role.",
      priority: "low" as const,
      actionItems: [
        "Research the company's culture, values, and recent news",
        "Network with professionals at the target company or in the industry",
        "Prepare specific examples of relevant achievements for interviews",
        "Consider additional certifications or training that would be valuable",
        "Update your LinkedIn profile to match job requirements",
        "Practice explaining how your experience relates to the job requirements"
      ],
      examples: []
    })
    
    // Industry-specific recommendations
    if (industry === "technology") {
      recommendations.push({
        category: "Tech Industry Focus",
        title: "Technology Industry Best Practices",
        description: "Follow technology industry best practices for resume optimization.",
        priority: "medium" as const,
        actionItems: [
          "Include GitHub profile and portfolio links if relevant",
          "Highlight open source contributions and side projects",
          "Emphasize technical problem-solving and innovation",
          "Show experience with modern development practices (Agile, CI/CD)",
          "Include relevant technical certifications and training"
        ],
        examples: []
      })
    } else if (industry === "finance") {
      recommendations.push({
        category: "Finance Industry Focus",
        title: "Finance Industry Best Practices",
        description: "Follow finance industry best practices for resume optimization.",
        priority: "medium" as const,
        actionItems: [
          "Highlight quantitative skills and financial modeling experience",
          "Emphasize risk management and compliance knowledge",
          "Include relevant financial certifications (CFA, CPA, etc.)",
          "Show experience with financial software and tools",
          "Demonstrate understanding of regulatory requirements"
        ],
        examples: []
      })
    }
    
    return recommendations
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
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
                <TabsTrigger value="job">Job Analysis</TabsTrigger>
                <TabsTrigger value="results" className="relative">
                  Analysis Results
                  {analysisResults && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="comprehensive" className="relative">
                  Comprehensive
                  {comprehensiveAnalysis && (
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
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.value} value={industry.value}>
                                {industry.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="level">Experience Level</Label>
                        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
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
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setResumeFile(file)
                              setIsUploading(true)
                              
                              try {
                                let text = ""
                                
                                if (file.type === "application/pdf") {
                                  // Handle PDF files with fallback to manual input
                                  text = "PDF file detected! For the best experience:\n\n📝 **Option 1: Copy & Paste Text**\n• Open your PDF in a PDF reader\n• Select all text (Ctrl+A / Cmd+A)\n• Copy and paste it into the text area below\n\n📄 **Option 2: Use Text Files**\n• Save your resume as a .txt file\n• Or copy the text content manually\n\n💡 **Why this approach?**\nThis ensures reliable text extraction and better analysis results.\n\nPlease paste your resume text below:"
                                  alert("PDF detected! For best results, please copy the text from your PDF and paste it below. This ensures reliable text extraction.")
                                } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                                         file.type === "application/msword" ||
                                         file.name.toLowerCase().endsWith('.docx') ||
                                         file.name.toLowerCase().endsWith('.doc')) {
                                  // Handle Word documents (.docx, .doc)
                                  text = "Word document detected! For the best experience:\n\n📝 **Option 1: Copy & Paste Text**\n• Open your Word document\n• Select all text (Ctrl+A / Cmd+A)\n• Copy and paste it into the text area below\n\n📄 **Option 2: Save as Text**\n• Save your document as a .txt file\n• Or copy the text content manually\n\n💡 **Why this approach?**\nWord documents contain formatting that can interfere with analysis. Plain text ensures better results.\n\nPlease paste your resume text below:"
                                  alert("Word document detected! For best results, please copy the text from your document and paste it below. This ensures reliable text extraction.")
                                } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith('.txt')) {
                                  // Handle plain text files
                                  const reader = new FileReader()
                                  text = await new Promise((resolve, reject) => {
                                    reader.onload = (e) => resolve(e.target?.result as string)
                                    reader.onerror = reject
                                    reader.readAsText(file)
                                  })
                                } else {
                                  // Handle other file types
                                  text = "Unsupported file type detected! For the best experience:\n\n📝 **Please copy & paste the text content**\n• Open your file in the appropriate application\n• Select all text (Ctrl+A / Cmd+A)\n• Copy and paste it into the text area below\n\n💡 **Why this approach?**\nThis ensures reliable text extraction and better analysis results.\n\nPlease paste your resume text below:"
                                  alert("Unsupported file type! For best results, please copy the text content and paste it below.")
                                }
                                
                                setResumeText(text)
                              } catch (error) {
                                console.error("Error processing file:", error)
                                alert("Error processing file. Please try again or use a different file format.")
                              } finally {
                                setIsUploading(false)
                              }
                            }
                          }}
                        className="hidden"
                      />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {isUploading ? "Processing..." : "Choose File"}
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
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="min-h-[200px]"
                      />
                      
                      {/* Speech Analysis Integration */}
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Speech-to-Text Integration</span>
                        </div>
                        <p className="text-sm text-blue-800 mb-3">
                          Use your speech analysis results as resume content
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => {
                              const speechTranscript = localStorage.getItem('speechTranscript')
                              if (speechTranscript) {
                                setResumeText(speechTranscript)
                                localStorage.removeItem('speechTranscript')
                                localStorage.removeItem('speechAnalysis')
                              } else {
                                alert('No speech transcript found. Please use the Speech Analysis page first.')
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Mic className="h-4 w-4" />
                            Use Speech Transcript
                          </Button>
                          <Button
                            onClick={() => window.open('/speech-analysis', '_blank')}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <ArrowRight className="h-4 w-4" />
                            Go to Speech Analysis
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Button
                        onClick={async () => {
                          if (!resumeText.trim()) {
                            alert("Please provide resume content to analyze")
                            return
                          }
                          setIsAnalyzing(true)
                          
                          try {
                            // Simulate analysis delay
                            await new Promise(resolve => setTimeout(resolve, 2000))
                            
                            console.log("Starting analysis with text length:", resumeText.length)
                            console.log("Selected industry:", selectedIndustry)
                            console.log("Selected level:", selectedLevel)
                            
                            const analysis = performResumeAnalysis(resumeText, selectedIndustry, selectedLevel)
                            console.log("Analysis completed:", analysis)
                            console.log("Analysis type:", typeof analysis)
                            console.log("Analysis keys:", Object.keys(analysis || {}))
                            
                            setAnalysisResults(analysis)
                            setIsAnalyzing(false)
                            
                            // Auto-switch to results tab after analysis
                            setActiveTab("results")
                            
                            console.log("State updated, activeTab set to:", "results")
                            
                            // Save to database
                            try {
                              await saveAnalysisToDatabase(analysis, selectedIndustry, selectedLevel)
                              console.log("Analysis saved to database successfully")
                            } catch (dbError) {
                              console.error("Failed to save to database:", dbError)
                              // Don't show error to user since analysis worked
                            }
                            
                            // Show success message
                            alert("Analysis completed! Check the 'Analysis Results' tab to see your detailed feedback.")
                          } catch (error: any) {
                            console.error("Analysis error:", error)
                            setIsAnalyzing(false)
                            alert("Error during analysis: " + (error?.message || "Unknown error"))
                          }
                        }}
                        disabled={!resumeText.trim() || isAnalyzing}
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
                            <FileCheck className="h-5 w-5" />
                            Analyze Resume
                            </>
                          )}
                        </Button>
                      
                      {resumeText && (
                        <>
                          <Button
                            onClick={() => {
                              setResumeFile(null)
                              setResumeText("")
                              setAnalysisResults(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                          >
                            <Trash2 className="h-5 w-5" />
                            Clear
                          </Button>
                          
                          {analysisResults && (
                            <Button
                              onClick={() => {
                                const data = {
                                  resumeAnalysis: analysisResults,
                                  industry: selectedIndustry,
                                  level: selectedLevel,
                                  timestamp: new Date().toISOString(),
                                  exportVersion: "1.0",
                                }
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.json`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              }}
                              variant="outline"
                              size="lg"
                              className="gap-2"
                            >
                              <Download className="h-5 w-5" />
                              Export
                            </Button>
                          )}
                        </>
                    )}
                  </div>

                    {/* Resume Preview */}
                    {resumeText && (
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Eye className="h-4 w-4 text-primary" />
                          Resume Preview
                        </h4>
                        <div className="p-4 rounded-lg bg-muted/50 border max-h-60 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-sans">{resumeText}</pre>
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
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                            </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="e.g., Google, Microsoft"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
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
                        onClick={() => {
                          if (!jobDescription.trim() || !jobTitle.trim()) {
                            alert("Please provide both job title and description")
                            return
                          }
                          setIsJobAnalyzing(true)
                          setTimeout(() => {
                            const analysis = performJobAnalysis(jobDescription, jobTitle, companyName, selectedIndustry, selectedLevel)
                            setJobAnalysis(analysis)
                            setIsJobAnalyzing(false)
                          }, 2000)
                        }}
                        disabled={!jobDescription.trim() || !jobTitle.trim() || isJobAnalyzing}
                        size="lg"
                        className="gap-2"
                      >
                        {isJobAnalyzing ? (
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

                          {/* Comprehensive Analysis Button */}
                          <div className="relative">
                            <Button
                              onClick={() => {
                                if (!jobDescription.trim() || !jobTitle.trim()) {
                                  alert("Please provide both job title and description")
                                  return
                                }
                                if (!resumeText.trim()) {
                                  alert("Please provide resume content first")
                                  return
                                }
                                if (!analysisResults) {
                                  alert("Please run resume analysis first")
                                  return
                                }
                                
                                // Perform comprehensive analysis
                                const comprehensiveResults = performComprehensiveAnalysis(
                                  analysisResults, 
                                  jobDescription, 
                                  jobTitle, 
                                  companyName, 
                                  selectedIndustry, 
                                  selectedLevel
                                )
                                
                                // Store the results
                                setComprehensiveAnalysis(comprehensiveResults)
                                
                                // Switch to comprehensive results tab
                                setActiveTab("comprehensive")
                              }}
                              disabled={!jobDescription.trim() || !jobTitle.trim() || !resumeText.trim() || !analysisResults}
                              size="lg"
                              variant="default"
                              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              title={
                                !jobDescription.trim() || !jobTitle.trim() ? "Please provide job title and description" :
                                !resumeText.trim() ? "Please provide resume content first" :
                                !analysisResults ? "Please run resume analysis first" :
                                "Click to perform comprehensive analysis"
                              }
                            >
                              <Zap className="h-5 w-5" />
                              Comprehensive Analysis
                            </Button>
                            
                            {/* Status indicator */}
                            {(!jobDescription.trim() || !jobTitle.trim() || !resumeText.trim() || !analysisResults) && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">!</span>
                              </div>
                            )}
                          </div>

                      {jobDescription && (
                        <Button
                          onClick={() => {
                            setJobDescription("")
                            setJobTitle("")
                            setCompanyName("")
                            setJobAnalysis(null)
                          }}
                          variant="outline"
                          size="lg"
                          className="gap-2"
                        >
                          <Trash2 className="h-5 w-5" />
                          Clear
                        </Button>
                          )}
                        </div>

                    {/* Job Analysis Results */}
                    {jobAnalysis && (
                      <div className="space-y-6 mt-8">
                        <Separator />
                        <h3 className="text-lg font-medium">Job Analysis Results</h3>
                        
                        {/* Job Overview */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">{jobAnalysis.jobTitle}</CardTitle>
                            <CardDescription>{jobAnalysis.company}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h6 className="font-medium text-sm mb-2">Required Skills ({jobAnalysis.requiredSkills.length})</h6>
                                <div className="flex flex-wrap gap-1">
                                  {jobAnalysis.requiredSkills.length > 0 ? (
                                    jobAnalysis.requiredSkills.slice(0, 8).map((skill, index) => (
                                      <Badge key={index} variant="default" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No required skills identified</span>
                                  )}
                                </div>
                                {jobAnalysis.requiredSkills.length > 8 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{jobAnalysis.requiredSkills.length - 8} more skills
                                  </p>
                                )}
                              </div>
                              <div>
                                <h6 className="font-medium text-sm mb-2">Preferred Skills ({jobAnalysis.preferredSkills.length})</h6>
                                <div className="flex flex-wrap gap-1">
                                  {jobAnalysis.preferredSkills.length > 0 ? (
                                    jobAnalysis.preferredSkills.slice(0, 8).map((skill, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No preferred skills identified</span>
                                  )}
                                </div>
                                {jobAnalysis.preferredSkills.length > 8 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    +{jobAnalysis.preferredSkills.length - 8} more skills
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-3xl font-bold text-primary mb-2">
                                {jobAnalysis.matchScore}%
                                </div>
                              <p className="text-sm text-muted-foreground">Resume-Job Match Score</p>
                              
                              {/* Debug Information */}
                              <details className="mt-2 text-left">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                  🔍 Show Score Details
                                </summary>
                                <div className="mt-2 p-2 bg-muted/30 rounded-lg text-xs space-y-1">
                                  <div><strong>Required Skills:</strong> {jobAnalysis.requiredSkills.length}</div>
                                  <div><strong>Preferred Skills:</strong> {jobAnalysis.preferredSkills.length}</div>
                                  <div><strong>Total Job Skills:</strong> {jobAnalysis.keywords.length}</div>
                                  <div><strong>Resume Keywords:</strong> {analysisResults?.keywords?.length || 0}</div>
                                  <div><strong>Calculation:</strong> 70% required + 30% preferred + bonus</div>
                                </div>
                              </details>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Targeted Recommendations */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Targeted Improvement Recommendations</CardTitle>
                            <CardDescription>
                              Specific actions to improve your resume for this job
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {jobAnalysis.recommendations.map((rec, index) => (
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
                                            {rec.actionItems.map((item, itemIndex) => (
                                              <li key={itemIndex} className="flex items-start gap-2">
                                                <span className="mt-1">•</span>
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                            </div>
                          </div>
                                    </div>
                                  </div>
                      </div>
                    ))}
                            </div>
                  </CardContent>
                </Card>

                        {/* Skills Gap Analysis */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Skills Gap Analysis</CardTitle>
                            <CardDescription>
                              Skills you need to develop or highlight for this position
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h6 className="font-medium mb-2 text-red-700">Missing Critical Skills</h6>
                                <div className="flex flex-wrap gap-2">
                                  {jobAnalysis.gaps.slice(0, 10).map((skill, index) => (
                                    <Badge key={index} variant="destructive" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                                <h6 className="font-medium text-amber-800 mb-2">💡 Development Strategy</h6>
                                <ul className="text-sm text-amber-700 space-y-1">
                                  <li>• Focus on learning the top 3-5 missing skills</li>
                                  <li>• Add relevant projects or certifications to your resume</li>
                                  <li>• Highlight transferable skills that relate to missing requirements</li>
                                  <li>• Consider online courses or bootcamps for technical skills</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Results Tab */}
              <TabsContent value="results" className="space-y-6">

                
                {!analysisResults ? (
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
                          <div className="text-6xl font-bold text-primary">{analysisResults.overallScore}%</div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>ATS Compatibility</span>
                              <Badge variant={analysisResults.atsScore >= 80 ? "default" : "secondary"}>
                                {analysisResults.atsScore}%
                              </Badge>
                      </div>
                            <Progress value={analysisResults.atsScore} className="h-2" />
                      </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Readability</span>
                              <Badge variant={analysisResults.readabilityScore >= 70 ? "default" : "secondary"}>
                                {analysisResults.readabilityScore}%
                              </Badge>
                    </div>
                            <Progress value={analysisResults.readabilityScore} className="h-2" />
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
                        {Object.entries(analysisResults.sections).map(([section, data]: [string, any]) => (
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
                          {analysisResults.suggestions.map((suggestion, index) => (
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
                          <h6 className="font-medium mb-2 text-green-700">Keywords Found ({analysisResults.keywords.length})</h6>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keywords.map((keyword, index) => (
                              <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h6 className="font-medium mb-2 text-red-700">Missing Keywords ({analysisResults.missingKeywords.length})</h6>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.missingKeywords.slice(0, 10).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-red-700 border-red-300">
                                {keyword}
                              </Badge>
                            ))}
                            {analysisResults.missingKeywords.length > 10 && (
                              <Badge variant="outline" className="text-muted-foreground">
                                +{analysisResults.missingKeywords.length - 10} more
                              </Badge>
              )}
            </div>
          </div>
                      </CardContent>
                    </Card>

                    {/* Job-Specific Insights */}
                    {jobAnalysis && (
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
                              {jobAnalysis.matchScore}%
                  </div>
                            <p className="text-lg font-medium text-primary">Job Match Score</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {jobAnalysis.jobTitle} at {jobAnalysis.company}
                            </p>
                </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium mb-2 text-green-700">Skills You Have</h6>
                              <div className="flex flex-wrap gap-1">
                                {jobAnalysis.requiredSkills.filter(skill => 
                                  analysisResults.keywords.some(keyword => 
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
                                {jobAnalysis.gaps.slice(0, 6).map((skill, index) => (
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
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Comprehensive Analysis Tab */}
              <TabsContent value="comprehensive" className="space-y-6">
                {!comprehensiveAnalysis ? (
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
                          How well your resume matches the {comprehensiveAnalysis.jobTitle} position at {comprehensiveAnalysis.companyName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-6xl font-bold text-primary mb-2">
                            {comprehensiveAnalysis.matchScore}%
                          </div>
                          <p className="text-lg font-medium text-primary">Match Score</p>
                          <p className="text-sm text-muted-foreground">
                            {comprehensiveAnalysis.matchScore >= 80 ? "Excellent match! Your resume aligns well with this position." :
                             comprehensiveAnalysis.matchScore >= 60 ? "Good match with room for improvement." :
                             "Significant gaps identified. Focus on the recommendations below."}
                          </p>
                          
                          {/* Debug Information */}
                          <details className="mt-4 text-left">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              🔍 Show Match Calculation Details
                            </summary>
                            <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs space-y-2">
                              <div><strong>Resume Keywords Found:</strong> {comprehensiveAnalysis.resumeAnalysis.keywords.length}</div>
                              <div><strong>Job Skills Identified:</strong> {comprehensiveAnalysis.jobSkills.length}</div>
                              <div><strong>Exact Matches:</strong> {comprehensiveAnalysis.matchingSkills.length}</div>
                              <div><strong>Missing Skills:</strong> {comprehensiveAnalysis.missingSkills.length}</div>
                              <div><strong>Match Rate:</strong> {comprehensiveAnalysis.matchingSkills.length > 0 ? 
                                Math.round((comprehensiveAnalysis.matchingSkills.length / comprehensiveAnalysis.jobSkills.length) * 100) : 0}%</div>
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
                                {comprehensiveAnalysis.matchingSkills.length}
                              </div>
                              <div className="text-blue-800">Matching Skills</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {comprehensiveAnalysis.missingSkills.length}
                              </div>
                              <div className="text-blue-800">Missing Skills</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {comprehensiveAnalysis.jobSkills.length}
                              </div>
                              <div className="text-blue-800">Total Job Skills</div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-blue-700 text-center">
                            Match Rate: {comprehensiveAnalysis.matchingSkills.length > 0 ? 
                              Math.round((comprehensiveAnalysis.matchingSkills.length / comprehensiveAnalysis.jobSkills.length) * 100) : 0}%
                          </div>
                        </div>

                        {/* Matching Skills */}
                        <div>
                          <h6 className="font-medium mb-3 text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Skills You Have ({comprehensiveAnalysis.matchingSkills.length})
                          </h6>
                          {comprehensiveAnalysis.matchingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {comprehensiveAnalysis.matchingSkills.map((skill: string, index: number) => (
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
                            Skills You Need ({comprehensiveAnalysis.missingSkills.length})
                          </h6>
                          {comprehensiveAnalysis.missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {comprehensiveAnalysis.missingSkills.map((skill: string, index: number) => (
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
                            {comprehensiveAnalysis.jobSkills.map((skill: string, index: number) => (
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
                          {comprehensiveAnalysis.recommendations.map((rec: any, index: number) => (
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
                          onClick={() => {
                            const data = {
                              comprehensiveAnalysis,
                              timestamp: new Date().toISOString(),
                              exportVersion: "2.0",
                            }
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `comprehensive-analysis-${new Date().toISOString().split('T')[0]}.json`
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }}
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
                    {analysisHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No analysis history yet. Start analyzing resumes to see your progress!</p>
                </div>
                    ) : (
                      <div className="space-y-4">
                        {analysisHistory.map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm capitalize">{record.industry} Industry</h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {record.match_score}%
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileCheck className="h-3 w-3" />
                                  {record.analysis?.atsScore || 0}% ATS
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(record.created_at).toLocaleDateString()}
                                </span>
                </div>
                </div>
                            <Badge variant={record.match_score >= 80 ? "default" : record.match_score >= 60 ? "secondary" : "destructive"}>
                              {record.match_score >= 80 ? "Excellent" : record.match_score >= 60 ? "Good" : "Needs Work"}
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
            {/* Industry Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Industry Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <h6 className="font-medium text-blue-900 mb-2">
                    {industries.find(i => i.value === selectedIndustry)?.label} Industry
                  </h6>
                  <p className="text-sm text-blue-800 mb-2">
                    Key keywords to include in your resume:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {industries.find(i => i.value === selectedIndustry)?.keywords.slice(0, 6).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                        {keyword}
                      </Badge>
                    ))}
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
                    {experienceLevels.find(l => l.value === selectedLevel)?.label}
                  </h6>
                  <p className="text-sm text-green-800">
                    Focus on: {experienceLevels.find(l => l.value === selectedLevel)?.focus}
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
