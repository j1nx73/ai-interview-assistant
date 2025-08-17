"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  Mic, 
  MicOff, 
  FileText,
  FileAudio,
  Target,
  MessageSquare,
  Plus,
  Trash2,
  User,
  Bot,
  BarChart3
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export default function EnhancedChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  
  // Chat History Management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  // STT and Voice Recording
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  
  // AI Service Status
  const [aiServiceStatus, setAiServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  
  // Resume Analysis Integration
  const [resumeText, setResumeText] = useState("")
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null)
  const [isResumeAnalyzing, setIsResumeAnalyzing] = useState(false)
  
  // Speech Analysis Integration
  const [speechTranscript, setSpeechTranscript] = useState("")
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null)
  const [isSpeechAnalyzing, setIsSpeechAnalyzing] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    initializeVoiceRecognition()
    loadChatSessions()
    createNewChatSession()
    checkAiServiceStatus()
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const initializeVoiceRecognition = () => {
    try {
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognitionInstance = new SpeechRecognition()
      
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'en-US'
        recognitionInstance.maxAlternatives = 1
      
        recognitionInstance.onstart = () => setIsRecording(true)
        recognitionInstance.onend = () => setIsRecording(false)
        recognitionInstance.onerror = () => setIsRecording(false)
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            }
          }
          
          if (finalTranscript) {
            setInputValue(finalTranscript)
            setSpeechTranscript(finalTranscript)
          }
        }
      
        setRecognition(recognitionInstance)
      }
    } catch (error) {
      console.error('Failed to initialize voice recognition:', error)
    }
  }

  const startRecording = () => {
    if (recognition) recognition.start()
  }

  const stopRecording = () => {
    if (recognition) recognition.stop()
  }

  const addMessage = (type: "user" | "ai" | "system", content: string) => {
    const message: Message = {
      id: generateUniqueId(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
    
    // Save message to Supabase
    if (currentSessionId) {
      saveMessageToSupabase(message)
    }
  }

  const saveMessageToSupabase = async (message: Message) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !currentSessionId) return

      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: currentSessionId,
        user_id: user.id,
        content: message.content,
        role: message.type === 'user' ? 'user' : 'assistant'
      })

      if (error) {
        console.error("Error saving message:", error)
        // If table doesn't exist, continue without saving
        if (error.code === '42P01') {
          console.log("Chat messages table doesn't exist yet - continuing without persistence")
        }
      } else {
        updateSessionMessageCount()
      }
    } catch (error) {
      console.error("Error saving message to Supabase:", error)
      // Continue without saving if there are database issues
    }
  }

  const updateSessionMessageCount = async () => {
    try {
      if (!currentSessionId) return

      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("id")
        .eq("conversation_id", currentSessionId)

      if (!error && messages) {
        const { error: updateError } = await supabase
          .from("chat_conversations")
          .update({ 
            message_count: messages.length,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentSessionId)

        if (updateError) {
          console.error("Error updating session:", updateError)
        }
      }
    } catch (error) {
      console.error("Error updating session message count:", error)
      // Continue without updating if there are database issues
    }
  }

  const createNewChatSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Create a local session for unauthenticated users
        const sessionId = generateUniqueId()
        const sessionTitle = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        
        setCurrentSessionId(sessionId)
        setMessages([])
        setChatSessions([])
        
        // Add welcome message
        addMessage("system", `Welcome! I'm your AI Career Coach. I can help with resume analysis, speech improvement, and interview preparation. How can I assist you today? Note: You're in demo mode - chat history won't be saved until you sign in.`)
        return
      }

      const sessionId = generateUniqueId()
      const sessionTitle = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
      
      // Try to create session in database, but continue if it fails
      try {
        const { error } = await supabase.from("chat_conversations").insert({
          id: sessionId,
          user_id: user.id,
          title: sessionTitle,
          message_count: 0
        })

        if (error) {
          console.error("Error creating chat session:", error)
          if (error.code === '42P01') {
            console.log("Chat conversations table doesn't exist yet - continuing without persistence")
          }
        }
      } catch (dbError: any) {
        console.error("Database error creating session:", dbError)
        // Continue without database persistence
      }

      setCurrentSessionId(sessionId)
      setMessages([])
      loadChatSessions()
      
      // Add welcome message based on AI service status
      const welcomeMessage = aiServiceStatus === 'available' 
        ? "Welcome! I'm your AI Career Coach powered by advanced AI technology. I can help with resume analysis, speech improvement, and interview preparation. Ask me anything about your career journey!"
        : "Welcome! I'm your AI Career Coach. I can help with resume analysis, speech improvement, and interview preparation. Note: AI features are currently using enhanced local analysis. For full AI-powered responses, please ensure your Gemini API key is configured."
      
      addMessage("system", welcomeMessage)
    } catch (error) {
      console.error("Error creating new chat session:", error)
    }
  }

  const loadChatSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
        const { data: sessions, error } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (!error && sessions) {
          setChatSessions(sessions)
        }
      } catch (dbError: any) {
        console.error("Database error loading sessions:", dbError)
        // If table doesn't exist, create a local session
        if (dbError.code === '42P01') {
          console.log("Chat conversations table doesn't exist - using local session")
          setChatSessions([])
        }
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error)
      setChatSessions([])
    }
  }

  const loadChatSession = async (sessionId: string) => {
    try {
      try {
        const { data: messages, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", sessionId)
          .order("created_at", { ascending: true })

        if (!error && messages) {
          const formattedMessages: Message[] = messages.map((msg: any) => ({
            id: msg.id,
            type: msg.role === 'user' ? 'user' : 'ai',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          
          setMessages(formattedMessages)
          setCurrentSessionId(sessionId)
          setActiveTab("chat")
        }
      } catch (dbError: any) {
        console.error("Database error loading session:", dbError)
        if (dbError.code === '42P01') {
          console.log("Chat messages table doesn't exist - starting fresh session")
          setMessages([])
          setCurrentSessionId(sessionId)
          setActiveTab("chat")
        }
      }
    } catch (error) {
      console.error("Error loading chat session:", error)
    }
  }

  const deleteChatSession = async (sessionId: string) => {
    try {
      // Try to delete from database, but continue if it fails
      try {
        // Delete all messages first
        const { error: messagesError } = await supabase
          .from("chat_messages")
          .delete()
          .eq("conversation_id", sessionId)

        if (messagesError && messagesError.code !== '42P01') {
          console.error("Error deleting messages:", messagesError)
          return
        }

        // Delete the conversation
        const { error: conversationError } = await supabase
          .from("chat_conversations")
          .delete()
          .eq("id", sessionId)

        if (conversationError && conversationError.code !== '42P01') {
          console.error("Error deleting conversation:", conversationError)
          return
        }
      } catch (dbError: any) {
        console.error("Database error deleting session:", dbError)
        // Continue with local cleanup if database fails
      }

      // If we deleted the current session, create a new one
      if (sessionId === currentSessionId) {
        createNewChatSession()
      } else {
        loadChatSessions()
      }
    } catch (error) {
      console.error("Error deleting chat session:", error)
    }
  }

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      addMessage("ai", "Please provide your resume text to analyze.")
      return
    }

    setIsResumeAnalyzing(true)
    addMessage("user", `Resume Analysis Request:\n\n${resumeText}`)

    try {
      // Try to get AI-powered resume analysis
      let aiFeedback = ""
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'resume-feedback',
            data: {
              resumeText: resumeText,
              jobDescription: "General resume optimization and ATS compatibility"
            }
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.feedback && !result.error) {
            aiFeedback = result.feedback
          }
        }
      } catch (aiError) {
        console.log('AI analysis not available, using enhanced local analysis')
      }

      // Enhanced local analysis
      const analysis = {
        wordCount: resumeText.split(/\s+/).length,
        hasContactInfo: /(email|phone|address|linkedin|github)/i.test(resumeText),
        hasSummary: /(summary|objective|profile|overview)/i.test(resumeText),
        hasExperience: /(experience|work|employment|job|position)/i.test(resumeText),
        hasEducation: /(education|degree|university|college|school)/i.test(resumeText),
        hasSkills: /(skills|competencies|technologies|tools|languages)/i.test(resumeText),
        hasAchievements: /(achieved|increased|improved|developed|created|managed)/i.test(resumeText),
        hasActionVerbs: /(developed|implemented|managed|led|created|designed|analyzed)/i.test(resumeText),
        suggestions: [] as string[]
      }

      // Generate comprehensive suggestions
      if (!analysis.hasContactInfo) analysis.suggestions.push("Add professional contact information (email, phone, LinkedIn)")
      if (!analysis.hasSummary) analysis.suggestions.push("Include a compelling professional summary (2-3 sentences)")
      if (!analysis.hasExperience) analysis.suggestions.push("Add detailed work experience with quantifiable achievements")
      if (!analysis.hasEducation) analysis.suggestions.push("Include education details and relevant certifications")
      if (!analysis.hasSkills) analysis.suggestions.push("List key skills and technologies relevant to your target role")
      if (!analysis.hasAchievements) analysis.suggestions.push("Quantify achievements with specific numbers and results")
      if (!analysis.hasActionVerbs) analysis.suggestions.push("Use strong action verbs to start bullet points")
      
      // ATS optimization tips
      if (analysis.wordCount < 200) analysis.suggestions.push("Consider adding more detail to meet ATS keyword requirements")
      if (analysis.wordCount > 800) analysis.suggestions.push("Streamline content to keep resume concise and focused")
      
      // Format suggestions
      if (!/(bullet|•|\-)/.test(resumeText)) analysis.suggestions.push("Use bullet points for better readability and ATS parsing")

      setResumeAnalysis(analysis)

      // Combine AI feedback with local analysis
      let response = `**Resume Analysis Complete!** 📊\n\n**Word Count:** ${analysis.wordCount}\n**Contact Info:** ${analysis.hasContactInfo ? '✅' : '❌'}\n**Summary:** ${analysis.hasSummary ? '✅' : '❌'}\n**Experience:** ${analysis.hasExperience ? '✅' : '❌'}\n**Education:** ${analysis.hasEducation ? '✅' : '❌'}\n**Skills:** ${analysis.hasSkills ? '✅' : '❌'}\n**Achievements:** ${analysis.hasAchievements ? '✅' : '❌'}\n**Action Verbs:** ${analysis.hasActionVerbs ? '✅' : '❌'}\n\n**Key Suggestions:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}`
      
      if (aiFeedback) {
        response += `\n\n**AI-Powered Feedback:**\n${aiFeedback}`
      }
      
      // Add success animation delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      addMessage("ai", response)
    } catch (error) {
      console.error("Error analyzing resume:", error)
      addMessage("ai", "Sorry, there was an error analyzing your resume. Please try again.")
    } finally {
      setIsResumeAnalyzing(false)
    }
  }

  const analyzeSpeech = async () => {
    if (!speechTranscript.trim()) {
      addMessage("ai", "Please provide speech content to analyze.")
      return
    }

    setIsSpeechAnalyzing(true)
    addMessage("user", `Speech Analysis Request:\n\n${speechTranscript}`)

    try {
      // Enhanced speech analysis with more detailed metrics
      const words = speechTranscript.split(/\s+/)
      const wordCount = words.length
      const estimatedDuration = Math.round(wordCount / 150)
      
      // Filler word detection
      const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of', 'right', 'so', 'well']
      const foundFillerWords = fillerWords.filter(word => 
        speechTranscript.toLowerCase().includes(word)
      )
      
      // Speaking rate analysis
      const speakingRate = wordCount / (estimatedDuration || 1)
      const isOptimalRate = speakingRate >= 120 && speakingRate <= 200
      
      // Confidence indicators
      const hasConfidentPhrases = /(i can|i will|i am confident|i believe|i know)/i.test(speechTranscript)
      const hasHesitantPhrases = /(maybe|i think|i guess|i'm not sure|perhaps)/i.test(speechTranscript)
      
      // Structure analysis
      const hasClearStructure = /(first|second|third|finally|in conclusion|to summarize)/i.test(speechTranscript)
      const hasExamples = /(for example|such as|like|specifically|instance)/i.test(speechTranscript)
      
      // Calculate confidence score
      let confidenceScore = 70 // Base score
      if (hasConfidentPhrases) confidenceScore += 10
      if (!foundFillerWords.length) confidenceScore += 10
      if (isOptimalRate) confidenceScore += 5
      if (hasClearStructure) confidenceScore += 5
      if (hasExamples) confidenceScore += 5
      if (hasHesitantPhrases) confidenceScore -= 10
      if (foundFillerWords.length > 2) confidenceScore -= 10
      
      confidenceScore = Math.min(100, Math.max(0, confidenceScore))

      const analysis = {
        wordCount,
        estimatedDuration,
        speakingRate: Math.round(speakingRate),
        fillerWords: foundFillerWords,
        fillerWordCount: foundFillerWords.length,
        confidence: confidenceScore,
        hasConfidentPhrases,
        hasHesitantPhrases,
        hasClearStructure,
        hasExamples,
        isOptimalRate,
        suggestions: [] as string[]
      }

      // Generate personalized suggestions
      if (foundFillerWords.length > 0) {
        analysis.suggestions.push(`Reduce filler words: ${foundFillerWords.slice(0, 3).join(', ')}`)
      }
      if (!isOptimalRate) {
        if (speakingRate < 120) {
          analysis.suggestions.push("Consider speaking a bit faster for better engagement")
        } else {
          analysis.suggestions.push("Slow down slightly for better clarity and comprehension")
        }
      }
      if (hasHesitantPhrases) {
        analysis.suggestions.push("Replace hesitant phrases with confident statements")
      }
      if (!hasClearStructure) {
        analysis.suggestions.push("Use transition words to create clear structure")
      }
      if (!hasExamples) {
        analysis.suggestions.push("Include specific examples to support your points")
      }
      if (wordCount < 50) {
        analysis.suggestions.push("Provide more detailed responses for better analysis")
      }
      if (wordCount > 300) {
        analysis.suggestions.push("Consider being more concise while maintaining clarity")
      }

      setSpeechAnalysis(analysis)

      const response = `**Speech Analysis Complete!** 🎤\n\n**Performance Metrics:**\n• Word Count: ${analysis.wordCount}\n• Estimated Duration: ~${analysis.estimatedDuration} minutes\n• Speaking Rate: ${analysis.speakingRate} WPM ${analysis.isOptimalRate ? '✅' : '⚠️'}\n• Confidence Score: ${analysis.confidence}%\n\n**Analysis Results:**\n• Filler Words: ${analysis.fillerWordCount > 0 ? `⚠️ ${analysis.fillerWordCount} detected` : '✅ None detected'}\n• Structure: ${analysis.hasClearStructure ? '✅ Clear' : '⚠️ Could improve'}\n• Examples: ${analysis.hasExamples ? '✅ Good use' : '⚠️ Could add more'}\n• Confidence: ${analysis.hasConfidentPhrases ? '✅ Strong' : '⚠️ Could strengthen'}\n\n**Key Suggestions:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}\n\n**Pro Tips for Interviews:**\n• Practice the STAR method for behavioral questions\n• Record yourself and review for improvement\n• Focus on breathing and pacing\n• Use power poses before speaking`
      
      // Add success animation delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      addMessage("ai", response)
    } catch (error) {
      console.error("Error analyzing speech:", error)
      addMessage("ai", "Sorry, there was an error analyzing your speech. Please try again.")
    } finally {
      setIsSpeechAnalyzing(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    addMessage("user", content.trim())
    setInputValue("")
    setIsTyping(true)

    try {
      // Simulate AI thinking time based on message length
      const thinkingTime = Math.min(Math.max(content.length * 50, 1000), 3000)
      await new Promise(resolve => setTimeout(resolve, thinkingTime))
      
      const response = await generateAIResponse(content.trim())
      addMessage("ai", response)
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage("ai", "Sorry, there was an error processing your message. Please try again.")
    } finally {
      setIsTyping(false)
    }
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const message = userMessage.toLowerCase()
      
      // Call the Gemini AI service for real responses
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'career-advice',
          data: {
            question: userMessage,
            context: `User is asking about: ${userMessage}. Provide helpful, actionable career advice.`
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result.text || "I'm sorry, I couldn't generate a response at the moment. Please try again."
      
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      
      // Fallback to smart mock responses based on message content
      const message = userMessage.toLowerCase()
      
      if (message.includes("resume") || message.includes("cv")) {
        return "I can help you with resume analysis! Switch to the 'Resume Analysis' tab to get started. I'll review your resume and provide feedback on structure, content, and optimization.\n\n**Pro Tip:** A well-optimized resume should include:\n• Clear contact information\n• Professional summary\n• Relevant work experience\n• Education and certifications\n• Key skills and competencies"
      }
      
      if (message.includes("speech") || message.includes("speaking") || message.includes("interview")) {
        return "Great question! I can help you improve your speaking skills and interview performance. Use the 'Speech Analysis' tab to analyze your speech patterns, or let's practice with interview questions!\n\n**Key Areas to Focus On:**\n• Speaking clarity and pace\n• Confidence and body language\n• Answer structure (STAR method)\n• Reducing filler words\n• Practice and preparation"
      }
      
      if (message.includes("salary") || message.includes("negotiate")) {
        return "Salary negotiation is crucial! Here are some tips:\n\n**Research & Preparation:**\n• Research market rates for your role and location\n• Understand your value and achievements\n• Practice your pitch beforehand\n\n**During Negotiation:**\n• Be confident but flexible\n• Focus on total compensation, not just salary\n• Highlight your unique contributions\n• Have a target range in mind\n\n**Pro Tip:** Always negotiate from a position of strength - wait until you have an offer!"
      }
      
      if (message.includes("confidence") || message.includes("nervous")) {
        return "Interview confidence comes with preparation! Here's how to build it:\n\n**Preparation Strategies:**\n• Practice common questions out loud\n• Record yourself and review\n• Research the company thoroughly\n• Prepare your success stories\n\n**Before the Interview:**\n• Use power poses (2 minutes)\n• Take deep breaths\n• Focus on your achievements\n• Remember: they want to hire you!\n\n**Mindset Shift:**\nThink of it as a conversation, not an interrogation. You're also evaluating if this role is right for you!"
      }
      
      if (message.includes("behavioral") || message.includes("star")) {
        return "Behavioral questions are perfect for the STAR method! Here's how to structure your answers:\n\n**STAR Method:**\n• **Situation:** Set the context\n• **Task:** Describe your responsibility\n• **Action:** Explain what you did\n• **Result:** Share the outcome\n\n**Example Questions:**\n• Tell me about a time you overcame a challenge\n• Describe a situation where you led a team\n• Give an example of a goal you achieved\n\n**Pro Tip:** Always end with a positive result and what you learned!"
      }
      
      if (message.includes("thank") || message.includes("thanks")) {
        return "You're very welcome! I'm here to help you succeed in your career journey. Feel free to ask me anything about:\n\n• Interview preparation\n• Resume optimization\n• Career development\n• Salary negotiation\n• Industry insights\n\nWhat would you like to work on next?"
      }
      
      return "I'm here to help you with your career and interview preparation! I can assist with resume analysis, speech improvement, and general career advice. What specific area would you like to focus on today?\n\n**I can help with:**\n• Resume optimization and ATS compatibility\n• Interview preparation and practice\n• Speech analysis and improvement\n• Career planning and development\n• Salary negotiation strategies\n\nJust let me know what you'd like to work on!"
    }
  }

  const checkAiServiceStatus = async () => {
    try {
      const response = await fetch('/api/gemini', { method: 'GET' })
      if (response.ok) {
        const result = await response.json()
        setAiServiceStatus(result.hasGeminiKey ? 'available' : 'unavailable')
      } else {
        setAiServiceStatus('unavailable')
      }
    } catch (error) {
      console.log('Could not check AI service status:', error)
      setAiServiceStatus('unavailable')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar - Chat History */}
        <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 border-b border-border"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={createNewChatSession}
                className="w-full justify-start gap-2 transition-all duration-200 hover:shadow-md"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </motion.div>
          </motion.div>

          {/* Chat Sessions List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {chatSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="relative group"
                >
                  <button
                    onClick={() => loadChatSession(session.id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 ${
                      currentSessionId === session.id ? 'bg-muted shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.message_count} messages • {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteChatSession(session.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-center border-b border-border rounded-none">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex w-full"
              >
                <TabsTrigger 
                  value="chat" 
                  className="flex-1 transition-all duration-200 hover:bg-muted/50"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="resume" 
                  className="flex-1 transition-all duration-200 hover:bg-muted/50"
                >
                  Resume Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="speech" 
                  className="flex-1 transition-all duration-200 hover:bg-muted/50"
                >
                  Speech Analysis
                </TabsTrigger>
              </motion.div>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col p-0">
              <div className="flex-1 flex flex-col">
                {/* AI Service Status Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-2 border-b border-border bg-muted/20"
                >
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        aiServiceStatus === 'available' ? 'bg-green-500' : 
                        aiServiceStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        {aiServiceStatus === 'available' ? 'AI Service Available' :
                         aiServiceStatus === 'checking' ? 'Checking AI Service...' : 'AI Service Unavailable'}
                      </span>
                    </div>
                    {aiServiceStatus === 'unavailable' && (
                      <div className="text-xs text-muted-foreground">
                        Using enhanced local analysis
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                        className={`flex gap-4 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.type !== 'user' && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                          >
                            <Bot className="h-5 w-5 text-primary" />
                          </motion.div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, x: message.type === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : message.type === 'system'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-muted/50 text-foreground'
                          }`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </motion.div>

                        {message.type === 'user' && (
                          <motion.div 
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                          >
                            <User className="h-5 w-5 text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="bg-muted/50 p-4 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="flex space-x-1">
                              <motion.div 
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div 
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div 
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border p-4"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask me anything about your career, interviews, or job search..."
                          className="min-h-[60px] resize-none pr-20 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 hover:bg-muted/30 focus:bg-muted/50"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage(inputValue)
                            }
                          }}
                        />
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant={isRecording ? "destructive" : "ghost"}
                              onClick={isRecording ? stopRecording : startRecording}
                              className="h-8 w-8 p-0 transition-all duration-200"
                            >
                              {isRecording ? (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <MicOff className="h-4 w-4" />
                                </motion.div>
                              ) : (
                                <Mic className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => sendMessage(inputValue)}
                          disabled={!inputValue.trim() || isTyping}
                          className="px-6 transition-all duration-200"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* Resume Analysis Tab */}
            <TabsContent value="resume" className="flex-1 p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Resume Analysis
                    </CardTitle>
                    <CardDescription>
                      Paste your resume text and get instant feedback and optimization suggestions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium mb-2">Resume Text</label>
                      <Textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume text here..."
                        className="min-h-[200px] transition-all duration-200 hover:bg-muted/30 focus:bg-muted/50"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Button 
                        onClick={analyzeResume}
                        disabled={!resumeText.trim() || isResumeAnalyzing}
                        className="w-full transition-all duration-200 hover:scale-105"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {isResumeAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                      </Button>
                    </motion.div>

                    {isResumeAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <motion.div 
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">Analyzing resume...</span>
                        </div>
                      </motion.div>
                    )}

                    {resumeAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="p-4 bg-muted/30 rounded-lg border border-primary/20"
                      >
                        <h4 className="font-semibold mb-2">Analysis Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Word Count: {resumeAnalysis.wordCount}</div>
                          <div>Contact Info: {resumeAnalysis.hasContactInfo ? '✅' : '❌'}</div>
                          <div>Summary: {resumeAnalysis.hasSummary ? '✅' : '❌'}</div>
                          <div>Experience: {resumeAnalysis.hasExperience ? '✅' : '❌'}</div>
                          <div>Education: {resumeAnalysis.hasEducation ? '✅' : '❌'}</div>
                          <div>Skills: {resumeAnalysis.hasSkills ? '✅' : '❌'}</div>
                        </div>
                        {resumeAnalysis.suggestions.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Suggestions:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {resumeAnalysis.suggestions.map((suggestion: string, index: number) => (
                                <motion.li 
                                  key={index} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className="text-sm"
                                >
                                  {suggestion}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Speech Analysis Tab */}
            <TabsContent value="speech" className="flex-1 p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileAudio className="h-5 w-5 text-primary" />
                      Speech Analysis
                    </CardTitle>
                    <CardDescription>
                      Analyze your speaking patterns and get feedback for interviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium mb-2">Speech Transcript</label>
                      <Textarea
                        value={speechTranscript}
                        onChange={(e) => setSpeechTranscript(e.target.value)}
                        placeholder="Paste your speech transcript or use voice input in the chat..."
                        className="min-h-[200px] transition-all duration-200 hover:bg-muted/30 focus:bg-muted/50"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Button 
                        onClick={analyzeSpeech}
                        disabled={!speechTranscript.trim() || isSpeechAnalyzing}
                        className="w-full transition-all duration-200 hover:scale-105"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {isSpeechAnalyzing ? 'Analyzing...' : 'Analyze Speech'}
                      </Button>
                    </motion.div>

                    {isSpeechAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <motion.div 
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">Analyzing speech...</span>
                        </div>
                      </motion.div>
                    )}

                    {speechAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="p-4 bg-muted/30 rounded-lg border border-primary/20"
                      >
                        <h4 className="font-semibold mb-2">Analysis Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Word Count: {speechAnalysis.wordCount}</div>
                          <div>Duration: ~{speechAnalysis.estimatedDuration} min</div>
                          <div>Filler Words: {speechAnalysis.fillerWordCount > 0 ? `⚠️ ${speechAnalysis.fillerWordCount} detected` : '✅ None detected'}</div>
                          <div>Confidence: {speechAnalysis.confidence}%</div>
                        </div>
                        {speechAnalysis.suggestions.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Suggestions:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {speechAnalysis.suggestions.map((suggestion: string, index: number) => (
                                <motion.li 
                                  key={index} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className="text-sm"
                                >
                                  {suggestion}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
