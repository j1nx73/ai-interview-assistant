"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Brain, Send, Mic, Paperclip, Lightbulb, Target, BookOpen, Users, Sparkles, Clock, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const suggestedQuestions = [
  "How do I answer 'Tell me about yourself'?",
  "What are good questions to ask the interviewer?",
  "How can I improve my confidence during interviews?",
  "What should I wear to a technical interview?",
  "How do I negotiate salary effectively?",
  "What are common behavioral interview questions?",
  "How do I write a compelling cover letter?",
  "What should I include in my job application?",
  "How do I prepare for a phone screening?",
  "What are red flags to watch for in job postings?",
  "How do I follow up after an interview?",
  "What are the best job search strategies?",
  "How do I prepare for a technical interview?",
  "What should I do if I'm nervous during interviews?",
  "How do I handle difficult interview questions?",
  "What are good questions to ask about company culture?",
  "How do I research a company before an interview?",
  "What should I bring to an in-person interview?",
  "How do I handle salary questions early in the process?",
  "What are signs that an interview went well?",
]

const quickActions = [
  {
    icon: Target,
    title: "Mock Interview",
    description: "Practice with AI interviewer",
    action: "mock-interview",
  },
  {
    icon: Lightbulb,
    title: "Interview Tips",
    description: "Get personalized advice",
    action: "tips",
  },
  {
    icon: BookOpen,
    title: "Question Bank",
    description: "Browse common questions",
    action: "questions",
  },
  {
    icon: Users,
    title: "Industry Insights",
    description: "Learn about your field",
    action: "insights",
  },
  {
    icon: Paperclip,
    title: "Job Application Help",
    description: "Resume & cover letter guidance",
    action: "job-application",
  },
  {
    icon: Sparkles,
    title: "Career Planning",
    description: "Long-term career strategy",
    action: "career-planning",
  },
]

export default function ChatBotPage() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatStats, setChatStats] = useState({ questionsToday: 0, recentTopics: [] })
  const [sessionId, setSessionId] = useState(null)
  const [conversationContext, setConversationContext] = useState({
    type: null,
    data: {}
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const scrollAreaRef = useRef(null)
  const inputRef = useRef(null)
  const supabase = createClient()
  
  // Unique ID generator to prevent duplicate keys
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  useEffect(() => {
    initializeChatSession()
    loadChatHistory()
    loadChatStats()
    initializeVoiceRecognition()
  }, [])

  const initializeVoiceRecognition = () => {
    try {
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
        const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false  // Changed to false to reduce no-speech errors
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      recognitionInstance.maxAlternatives = 1
      
      recognitionInstance.onstart = () => {
        setIsRecording(true)
      }
      
      recognitionInstance.onresult = (event) => {
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
        
        if (finalTranscript) {
          setInputValue(finalTranscript)
        }
      }
      
      recognitionInstance.onerror = (event) => {
        // Handle no-speech and related errors silently (these are normal)
        if (event.error === 'no-speech' || 
            event.error === 'aborted' || 
            event.error === 'service-not-allowed') {
          // These are normal, just continue recording - don't log as error
          return
        }
        
        // Handle specific error types gracefully
        if (event.error === 'audio-capture' || event.error === 'not-allowed') {
          setIsRecording(false)
          const errorMessage = {
            id: Date.now(),
            type: "ai",
            content: "Microphone access denied. Please allow microphone access and try again.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
          return
        }
        
        if (event.error === 'network') {
          setIsRecording(false)
          const errorMessage = {
            id: Date.now(),
            type: "ai",
            content: "Network error. Please check your connection and try again.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
          return
        }
        
        // Handle other errors silently to avoid console spam
        setIsRecording(false)
        
        // Show user-friendly error message for other errors
        const errorMessage = {
          id: Date.now(),
          type: "ai",
          content: `Voice recognition issue. Please try again or type your message.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
        // Auto-send if there's content and it's not just interim results
        if (inputValue.trim() && inputValue.length > 10) {
          setTimeout(() => {
            sendMessage(inputValue)
          }, 500) // Small delay to let user see the transcribed text
        }
        
        // Restart recognition if user is still in recording mode
        if (isRecording) {
          setTimeout(() => {
            if (recognition) {
              recognition.start()
            }
          }, 1000)
        }
      }
      
      setRecognition(recognitionInstance)
      }
    } catch (error) {
      // Silently handle any speech recognition initialization errors
      console.log('Speech recognition not available:', error)
    }
  }

  const initializeChatSession = () => {
    const newSessionId = crypto.randomUUID()
    setSessionId(newSessionId)
  }

  const loadChatHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load recent chat history (last 50 messages)
      const { data: chatHistory, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: true })
        .limit(50)

      if (error) {
        console.error("Error loading chat history:", error)
        // Show welcome message if no history
        setMessages([
          {
            id: 1,
            type: "ai",
            content:
              "Hello! I'm your comprehensive AI Career Assistant. I'm here to help you with:\n\n🎯 **Interview Preparation** - Mock interviews, question practice, confidence building\n📝 **Job Applications** - Resume optimization, cover letters, application strategies\n🚀 **Career Development** - Skill planning, industry insights, long-term strategy\n💼 **Professional Growth** - Networking, negotiation, career transitions\n\nWhat would you like to work on today? I can help with specific questions or guide you through any career challenge!",
            timestamp: new Date(),
          },
        ])
        return
      }

      if (chatHistory && chatHistory.length > 0) {
        const formattedMessages = []
        chatHistory.forEach((chat) => {
          formattedMessages.push({
            id: `${chat.id}-user`,
            type: "user",
            content: chat.message,
            timestamp: new Date(chat.timestamp),
          })
          formattedMessages.push({
            id: `${chat.id}-ai`,
            type: "ai",
            content: chat.response,
            timestamp: new Date(chat.timestamp),
          })
        })
        setMessages(formattedMessages)
      } else {
        // Show welcome message for new users
        setMessages([
          {
            id: 1,
            type: "ai",
            content:
              "Hello! I'm your comprehensive AI Career Assistant. I'm here to help you with:\n\n🎯 **Interview Preparation** - Mock interviews, question practice, confidence building\n📝 **Job Applications** - Resume optimization, cover letters, application strategies\n🚀 **Career Development** - Skill planning, industry insights, long-term strategy\n💼 **Professional Growth** - Networking, negotiation, career transitions\n\nWhat would you like to work on today? I can help with specific questions or guide you through any career challenge!",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const loadChatStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get today's question count
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todayChats, error: todayError } = await supabase
        .from("chat_history")
        .select("id")
        .eq("user_id", user.id)
        .gte("timestamp", today.toISOString())

      // Get recent topics (last 10 unique topics)
      const { data: recentChats, error: recentError } = await supabase
        .from("chat_history")
        .select("message")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(10)

      if (!todayError && !recentError) {
        const questionsToday = todayChats?.length || 0
        const recentTopics =
          recentChats
            ?.map((chat) => {
              const message = chat.message.toLowerCase()
              if (message.includes("behavioral")) return "Behavioral questions"
              if (message.includes("salary") || message.includes("negotiate")) return "Salary negotiation"
              if (message.includes("technical")) return "Technical interviews"
              if (message.includes("confidence")) return "Interview confidence"
              if (message.includes("questions to ask")) return "Questions for interviewer"
              if (message.includes("cover letter") || message.includes("resume")) return "Job applications"
              if (message.includes("career") || message.includes("planning")) return "Career development"
              if (message.includes("phone") || message.includes("screening")) return "Phone interviews"
              if (message.includes("follow up") || message.includes("thank you")) return "Interview follow-up"
              if (message.includes("red flags") || message.includes("warning")) return "Job evaluation"
              return "General interview prep"
            })
            .filter((topic, index, arr) => arr.indexOf(topic) === index)
            .slice(0, 5) || []

        setChatStats({ questionsToday, recentTopics })
      }
    } catch (error) {
      console.error("Error loading chat stats:", error)
    }
  }

  const saveChatToHistory = async (userMessage, aiResponse) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("chat_history").insert({
        user_id: user.id,
        message: userMessage,
        response: aiResponse,
        session_id: sessionId,
      })

      if (error) {
        console.error("Error saving chat history:", error)
      } else {
        // Update stats after saving
        loadChatStats()
      }
    } catch (error) {
      console.error("Error saving chat to history:", error)
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const sendMessage = async (content) => {
    if (!content.trim()) return

    const userMessage = {
        id: generateUniqueId(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // Check if this is a follow-up to a specific conversation type
      let geminiAction = 'career-advice'
      let geminiData = {
        question: content.trim(),
        context: `User is seeking career advice. Previous topics: ${chatStats.recentTopics.join(', ')}`
      }

      // Handle resume analysis conversation
      if (conversationContext.type === 'resume-analysis') {
        if (conversationContext.data.resume && !conversationContext.data.jobDescription) {
          // User has provided resume, now asking for job description
          geminiAction = 'resume-feedback'
          geminiData = {
            resumeText: conversationContext.data.resume,
            jobDescription: content.trim()
          }
          setConversationContext({ type: null, data: {} })
        } else if (!conversationContext.data.resume) {
          // First message in resume analysis - store resume
          setConversationContext({
            type: 'resume-analysis',
            data: { resume: content.trim() }
          })
          const aiResponse = "Great! I've captured your resume. Now please paste the job description you'd like me to analyze it against, and I'll provide detailed feedback on how well they match."
          const aiMessage = {
            id: generateUniqueId(),
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMessage])
          setIsTyping(false)
          await saveChatToHistory(content.trim(), aiResponse)
          return
        }
      }

      // Handle cover letter conversation
      if (conversationContext.type === 'cover-letter') {
        if (conversationContext.data.jobTitle && !conversationContext.data.company) {
          // User has provided job title, now asking for company
          geminiData.company = content.trim()
          geminiData.userBackground = conversationContext.data.userBackground || 'Experienced professional'
          geminiAction = 'cover-letter-template'
          setConversationContext({ type: null, data: {} })
        } else if (conversationContext.data.jobTitle && !conversationContext.data.userBackground) {
          // User has provided job title and company, now asking for background
          geminiData.company = conversationContext.data.company
          geminiData.userBackground = content.trim()
          geminiAction = 'cover-letter-template'
          setConversationContext({ type: null, data: {} })
        } else if (!conversationContext.data.jobTitle) {
          // First message in cover letter - store job title
          setConversationContext({
            type: 'cover-letter',
            data: { jobTitle: content.trim() }
          })
          const aiResponse = "Perfect! I've noted the job title. Now please tell me the company name you're applying to."
          const aiMessage = {
            id: generateUniqueId(),
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMessage])
          setIsTyping(false)
          await saveChatToHistory(content.trim(), aiResponse)
          return
        }
      }

      // Use Gemini AI for intelligent responses
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: geminiAction,
            data: geminiData
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const aiData = await response.json()
        const aiResponse = aiData.text || generateFallbackResponse(content)
        
      const aiMessage = {
          id: generateUniqueId(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)

      await saveChatToHistory(content.trim(), aiResponse)
        return
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError)
        
        // Check if it's a configuration error
        if (geminiError.message.includes('not configured') || geminiError.message.includes('API key')) {
          const configMessage = {
            id: generateUniqueId(),
            type: "ai",
            content: `I'm currently using my local knowledge to help you. For enhanced AI-powered responses, please configure the Gemini API key.\n\n**Setup Instructions:**\n1. Get your API key from [Google AI Studio](https://aistudio.google.com/)\n2. Create a \`.env.local\` file in your project root\n3. Add: \`NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here\`\n4. Restart your development server\n\n**Your question:** ${content.trim()}\n\n**My response:** ${generateFallbackResponse(content)}`,
          }
          setMessages((prev) => [...prev, configMessage])
          setIsTyping(false)
          await saveChatToHistory(content.trim(), configMessage.content)
          return
        }
        
        // For other errors, throw to be caught by outer catch block
        throw geminiError
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback to local responses if Gemini fails
      const fallbackResponse = generateFallbackResponse(content)
      const aiMessage = {
        id: generateUniqueId(),
        type: "ai",
        content: fallbackResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)

      await saveChatToHistory(content.trim(), fallbackResponse)
    }
  }

  const generateFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase()

    // Resume Analysis Requests
    if (input.includes("analyze my resume") || input.includes("resume against") || input.includes("resume feedback")) {
      return "I'd be happy to help you analyze your resume! To provide the most targeted feedback, I'll need:\n\n1. **Your resume content** (you can paste it here)\n2. **The job description** you're targeting\n\nOnce you share both, I can provide:\n• Key strengths that match the job requirements\n• Areas for improvement and optimization\n• ATS compatibility tips\n• Specific suggestions for better alignment\n• An overall match score\n\nPlease paste your resume and the job description, and I'll give you detailed, actionable feedback!"
    }

    // Cover Letter Requests
    if (input.includes("cover letter") || input.includes("write a cover letter")) {
      return "I can help you create a compelling cover letter! To generate the best template, I'll need:\n\n1. **Job title** you're applying for\n2. **Company name**\n3. **Your background** (experience, skills, achievements)\n\nOnce you provide these details, I can create:\n• A professional opening paragraph\n• Body paragraphs connecting your experience to the role\n• A strong closing with call to action\n• Customization tips for your specific situation\n\nShare the details and I'll craft a cover letter that helps you stand out!"
    }

    // Industry Trends Requests
    if (input.includes("trends") || input.includes("industry") || input.includes("opportunities")) {
      return "I'd love to share current industry insights with you! To provide the most relevant information, let me know:\n\n1. **Your industry** (e.g., Technology, Healthcare, Finance)\n2. **Your role or target position** (e.g., Software Engineer, Data Scientist)\n\nI can then share:\n• Current market trends and opportunities\n• In-demand skills and technologies\n• Salary trends and compensation insights\n• Interview preparation tips for your field\n• Professional development recommendations\n\nWhat industry and role would you like insights on?"
    }

    // Interview Questions
    if (input.includes("tell me about yourself")) {
      return "Great question! The 'Tell me about yourself' question is your elevator pitch. Structure it with: 1) Brief professional background, 2) Key achievements relevant to the role, 3) Why you're interested in this position. Keep it to 2-3 minutes and focus on what's most relevant to the job you're applying for.\n\nExample: 'I'm a [Your Role] with [X] years of experience in [Industry]. I've successfully [Key Achievement] and I'm passionate about [Relevant Interest]. I'm excited about this opportunity because [Why This Role/Company].'"
    }

    if (input.includes("confidence") || input.includes("nervous")) {
      return "Building interview confidence takes practice! Here are some tips:\n\n1) **Practice Out Loud**: Rehearse your answers until they feel natural\n2) **Research Thoroughly**: Know the company, role, and industry inside out\n3) **STAR Method**: Structure answers with Situation, Task, Action, Result\n4) **Mock Interviews**: Practice with friends or use our mock interview feature\n5) **Arrive Early**: Give yourself time to settle in and take deep breaths\n6) **Power Poses**: Use confident body language before the interview\n\nRemember, they invited you because they're already interested in your profile!"
    }

    if (input.includes("questions to ask")) {
      return "Asking thoughtful questions shows your interest and preparation! Here are excellent questions to ask:\n\n**About the Role:**\n• 'What does success look like in this role in the first 6 months?'\n• 'What are the biggest challenges facing the team right now?'\n• 'How would you describe the ideal candidate for this position?'\n\n**About the Company:**\n• 'How would you describe the company culture?'\n• 'What opportunities are there for professional development?'\n• 'What are the company's goals for the next year?'\n\n**About the Team:**\n• 'Who would I be working most closely with?'\n• 'What's the team structure like?'\n• 'How does the team collaborate on projects?'\n\nAvoid asking about salary, benefits, or vacation time in the first interview."
    }

    if (input.includes("salary") || input.includes("negotiate")) {
      return "Salary negotiation is a crucial skill! Here's a strategic approach:\n\n**Before the Interview:**\n• Research market rates for your role, experience, and location\n• Know your worth and set a target range\n• Consider the entire package (benefits, PTO, equity, etc.)\n\n**During Negotiation:**\n• Let them make the first offer\n• Ask for time to consider if needed\n• Justify your ask with specific achievements and value\n• Stay professional and positive throughout\n\n**Key Phrases:**\n• 'Based on my research and experience, I was thinking more in the range of...'\n• 'I'm excited about this opportunity, and I want to ensure we're aligned on compensation'\n• 'What's the salary range for this position?'\n\nRemember: Negotiation shows you value yourself and your skills!"
    }

    // Job Application Questions
    if (input.includes("cover letter") || input.includes("cover letter")) {
      return "A compelling cover letter can make you stand out! Here's the structure:\n\n**Opening (1 paragraph):**\n• Hook the reader with enthusiasm\n• Mention the specific position and company\n• Show you've done your research\n\n**Body (2-3 paragraphs):**\n• Connect your experience to the job requirements\n• Use specific examples and achievements\n• Explain why you're interested in this company\n• Demonstrate cultural fit\n\n**Closing (1 paragraph):**\n• Reiterate your interest\n• Include a call to action\n• Thank them for considering you\n\n**Pro Tips:**\n• Keep it to one page\n• Use active voice and strong verbs\n• Customize for each application\n• Proofread multiple times"
    }

    if (input.includes("job application") || input.includes("what should i include")) {
      return "A complete job application should include:\n\n**Essential Documents:**\n• **Resume**: Tailored to the specific role\n• **Cover Letter**: Personalized for the company\n• **Portfolio/Work Samples**: If applicable to your field\n\n**Additional Materials:**\n• **References**: Professional contacts who can vouch for you\n• **Certifications**: Relevant professional certifications\n• **Writing Samples**: For roles requiring written communication\n• **Project Examples**: Code, designs, or case studies\n\n**Application Tips:**\n• Follow the company's application instructions exactly\n• Use keywords from the job description in your materials\n• Ensure all documents are error-free and professional\n• Save copies of everything you submit\n• Follow up within a week if you haven't heard back"
    }

    if (input.includes("phone screening") || input.includes("phone interview")) {
      return "Phone screenings are your first chance to make an impression! Here's how to prepare:\n\n**Before the Call:**\n• Research the company and role thoroughly\n• Prepare your elevator pitch\n• Have your resume and notes ready\n• Find a quiet, professional environment\n• Test your phone/connection\n\n**During the Call:**\n• Speak clearly and at a measured pace\n• Use the STAR method for behavioral questions\n• Ask thoughtful questions about the role\n• Take notes on key points\n• Show enthusiasm and energy\n\n**Common Questions:**\n• 'Tell me about yourself'\n• 'Why are you interested in this position?'\n• 'What are your salary expectations?'\n• 'When can you start?'\n\n**Pro Tips:**\n• Stand up while talking to sound more energetic\n• Smile - it comes through in your voice\n• Have a backup plan if the call drops"
    }

    if (input.includes("red flags") || input.includes("warning signs")) {
      return "Watch out for these red flags in job postings and interviews:\n\n**Job Posting Red Flags:**\n• Vague or overly broad job descriptions\n• Unrealistic requirements for the salary offered\n• Multiple roles combined into one position\n• Excessive overtime expectations\n• 'Rock star' or 'ninja' terminology\n• No mention of benefits or compensation\n\n**Interview Red Flags:**\n• Interviewer seems unprepared or disinterested\n• Negative comments about current employees\n• High turnover mentioned casually\n• Unprofessional behavior or inappropriate questions\n• Pressure to make quick decisions\n• Vague answers about role responsibilities\n\n**Company Red Flags:**\n• Poor online reviews from employees\n• High turnover rates\n• Financial instability\n• Poor communication during hiring process\n• Unrealistic promises or expectations\n\nTrust your instincts - if something feels off, it probably is!"
    }

    if (input.includes("follow up") || input.includes("after interview")) {
      return "Following up after an interview is crucial for staying top of mind:\n\n**Timing:**\n• Send a thank-you email within 24 hours\n• Follow up on status after 1-2 weeks\n• Be patient but persistent\n\n**Thank-You Email Structure:**\n• Thank them for their time\n• Reiterate your interest in the position\n• Reference specific points from the conversation\n• Include any additional information they requested\n• End with a call to action\n\n**Follow-Up Strategy:**\n• Week 1: Thank-you email\n• Week 2: Status inquiry (if no response)\n• Week 3: Final follow-up\n• After that: Move on and focus on other opportunities\n\n**Pro Tips:**\n• Keep follow-ups professional and brief\n• Don't be pushy or desperate\n• Use each interaction to add value\n• Maintain a positive, enthusiastic tone"
    }

    if (input.includes("job search") || input.includes("search strategies")) {
      return "Effective job search strategies to maximize your opportunities:\n\n**Multi-Channel Approach:**\n• **Job Boards**: LinkedIn, Indeed, Glassdoor, industry-specific sites\n• **Company Websites**: Apply directly on company career pages\n• **Networking**: Professional events, LinkedIn connections, alumni networks\n• **Recruiters**: Build relationships with industry recruiters\n• **Social Media**: Follow companies and industry leaders\n\n**Proactive Strategies:**\n• **Informational Interviews**: Learn about companies and roles\n• **Cold Outreach**: Contact hiring managers directly\n• **Industry Events**: Attend conferences and meetups\n• **Skill Development**: Take courses to fill skill gaps\n• **Portfolio Building**: Create work samples and projects\n\n**Organization Tips:**\n• Track all applications in a spreadsheet\n• Set daily/weekly goals for applications\n• Follow up systematically\n• Keep learning and improving your materials\n\n**Mindset:**\n• Treat job searching like a full-time job\n• Stay positive and persistent\n• Learn from each rejection\n• Focus on quality over quantity"
    }

    // Behavioral Interview Questions
    if (input.includes("behavioral") || input.includes("star method")) {
      return "Behavioral questions assess how you've handled real situations. Use the STAR method:\n\n**STAR Method Structure:**\n\n**S - Situation**: Set the context\n• 'In my previous role at [Company]...'\n• 'During a challenging project...'\n\n**T - Task**: Describe your responsibility\n• 'I was responsible for...'\n• 'My goal was to...'\n\n**A - Action**: Explain what you did\n• 'I analyzed the problem and...'\n• 'I collaborated with the team to...'\n• 'I implemented a solution that...'\n\n**R - Result**: Share the outcome\n• 'As a result, we achieved...'\n• 'This led to a 25% improvement in...'\n\n**Common Behavioral Questions:**\n• 'Tell me about a time you faced a difficult challenge'\n• 'Describe a situation where you had to work with a difficult person'\n• 'Give me an example of when you went above and beyond'\n• 'Tell me about a time you failed and what you learned'\n\n**Pro Tips:**\n• Prepare 5-7 strong examples\n• Use recent, relevant experiences\n• Quantify results when possible\n• Practice your responses out loud"
    }

    // Technical Interview Questions
    if (input.includes("technical") || input.includes("coding") || input.includes("technical interview")) {
      return "Technical interviews can be challenging, but preparation is key!\n\n**Before the Interview:**\n• Review fundamental concepts in your field\n• Practice coding problems on platforms like LeetCode, HackerRank\n• Brush up on data structures and algorithms\n• Review your past projects and be ready to discuss them\n\n**During the Interview:**\n• **Clarify Requirements**: Ask questions before starting\n• **Think Aloud**: Explain your thought process\n• **Start Simple**: Begin with a basic solution, then optimize\n• **Test Your Code**: Check edge cases and errors\n• **Discuss Trade-offs**: Explain your design decisions\n\n**Common Technical Topics:**\n• **Programming**: Data structures, algorithms, system design\n• **Databases**: SQL queries, database design, optimization\n• **System Design**: Scalability, performance, architecture\n• **Problem Solving**: Logic, math, analytical thinking\n\n**Pro Tips:**\n• Practice whiteboard coding\n• Learn to estimate time complexity\n• Be honest about what you don't know\n• Show enthusiasm for learning new things"
    }

    // General career advice
    if (input.includes("career") || input.includes("planning") || input.includes("development")) {
      return "Career planning is a journey, not a destination! Here's a strategic approach:\n\n**Short-term (1-2 years):**\n• Identify skills gaps and fill them\n• Build a strong professional network\n• Gain relevant experience through projects\n• Consider certifications or additional education\n\n**Medium-term (3-5 years):**\n• Define your career goals and values\n• Develop leadership and management skills\n• Build industry expertise and thought leadership\n• Explore different roles and industries\n\n**Long-term (5+ years):**\n• Consider entrepreneurship or consulting\n• Develop strategic thinking and vision\n• Build a personal brand\n• Mentor others and give back\n\n**Continuous Development:**\n• Stay current with industry trends\n• Build transferable skills\n• Network consistently\n• Seek feedback and mentorship\n• Take calculated risks\n\nRemember: Your career path doesn't have to be linear. Focus on growth, learning, and finding work that aligns with your values!"
    }

    // Additional interview preparation questions
    if (input.includes("nervous") || input.includes("anxiety")) {
      return "Interview nerves are completely normal! Here's how to manage them:\n\n**Before the Interview:**\n• **Practice Deep Breathing**: 4-7-8 technique (inhale 4, hold 7, exhale 8)\n• **Power Poses**: Stand in confident poses for 2 minutes before\n• **Visualization**: Imagine yourself succeeding in the interview\n• **Prepare Thoroughly**: The more prepared you are, the less nervous you'll be\n\n**During the Interview:**\n• **Take Your Time**: It's okay to pause and think before answering\n• **Focus on Breathing**: Take deep breaths between questions\n• **Remember**: They want you to succeed - they invited you!\n• **Be Honest**: If you're nervous, it's okay to mention it briefly\n\n**Pro Tips:**\n• Arrive 15 minutes early to settle in\n• Bring water to stay hydrated\n• Use positive self-talk\n• Remember: Nervousness shows you care!\n\n**Quick Calming Techniques:**\n• Count backwards from 100 by 7s\n• Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste\n• Squeeze and release your fists slowly"
    }

    if (input.includes("difficult") || input.includes("challenging") || input.includes("hard questions")) {
      return "Difficult interview questions are opportunities to shine! Here's how to handle them:\n\n**General Strategy:**\n• **Stay Calm**: Take a deep breath and think before responding\n• **Ask for Clarification**: 'Could you give me an example of what you mean?'\n• **Buy Time**: 'That's a great question. Let me think about that for a moment.'\n• **Be Honest**: It's okay to say you don't know something\n\n**Types of Difficult Questions:**\n\n**1. Weakness Questions:**\n• 'What's your biggest weakness?'\n• Strategy: Choose a real weakness + how you're improving it\n• Example: 'I sometimes spend too much time perfecting details. I'm working on setting time limits and focusing on the 80/20 rule.'\n\n**2. Failure Questions:**\n• 'Tell me about a time you failed.'\n• Strategy: Focus on what you learned, not the failure itself\n• Example: 'I once missed a deadline because I underestimated the scope. Now I always add 20% buffer time and break projects into smaller milestones.'\n\n**3. Hypothetical Questions:**\n• 'What would you do if...?'\n• Strategy: Think out loud, ask clarifying questions, show your process\n\n**4. Personal Questions:**\n• 'Are you married?' 'Do you have children?'\n• Strategy: Politely redirect to professional relevance\n• Example: 'I prefer to keep my personal life private, but I can tell you about my professional availability and commitment to this role.'\n\n**Pro Tips:**\n• Practice difficult questions beforehand\n• Have 2-3 strong examples ready\n• Focus on growth and learning\n• Remember: Difficult questions often lead to the best conversations!"
    }

    if (input.includes("company culture") || input.includes("culture fit")) {
      return "Company culture questions show you're thinking long-term! Here are excellent questions to ask:\n\n**About Values & Mission:**\n• 'How do the company's values show up in day-to-day work?'\n• 'What does the company's mission mean to you personally?'\n• 'How does the company support employees in living its values?'\n\n**About Work Environment:**\n• 'How would you describe a typical day in this role?'\n• 'What's the balance between collaboration and independent work?'\n• 'How does the team handle conflicts or disagreements?'\n• 'What's the communication style like across teams?'\n\n**About Growth & Development:**\n• 'How does the company support professional development?'\n• 'What opportunities are there for learning new skills?'\n• 'How do you measure success and growth in this role?'\n• 'What mentorship or coaching is available?'\n\n**About Work-Life Balance:**\n• 'How does the company support work-life balance?'\n• 'What's the policy on flexible work arrangements?'\n• 'How do you handle busy periods or deadlines?'\n\n**About Team Dynamics:**\n• 'What's the team structure and how do people collaborate?'\n• 'How do you celebrate successes and handle challenges?'\n• 'What's the most rewarding part of working here?'\n\n**Pro Tips:**\n• Listen for consistency between what they say and what you've researched\n• Pay attention to body language and enthusiasm\n• Ask follow-up questions based on their responses\n• Trust your instincts about cultural fit"
    }

    if (input.includes("research company") || input.includes("company research")) {
      return "Thorough company research is crucial for interview success! Here's your research checklist:\n\n**Company Basics:**\n• **Website**: About page, mission, values, recent news\n• **Social Media**: LinkedIn, Twitter, Instagram for company culture\n• **News & Press**: Recent announcements, funding, acquisitions\n• **Financials**: Revenue, growth, market position (if public)\n\n**Product/Service Understanding:**\n• **What they do**: Core products/services, target market\n• **How they do it**: Technology, approach, competitive advantages\n• **Why they do it**: Mission, vision, company story\n• **Recent developments**: New features, partnerships, expansions\n\n**People & Culture:**\n• **Leadership**: CEO background, management style, company vision\n• **Employees**: LinkedIn profiles, Glassdoor reviews, employee testimonials\n• **Culture**: Values, work environment, benefits, perks\n• **Growth**: Hiring trends, expansion plans, career opportunities\n\n**Industry & Market:**\n• **Competitors**: Who they compete with, market positioning\n• **Trends**: Industry developments, challenges, opportunities\n• **Regulations**: Compliance, legal environment, industry standards\n\n**Interview Preparation:**\n• **Questions to ask**: Based on your research\n• **Talking points**: How your experience relates to their needs\n• **Company knowledge**: Recent news, challenges, opportunities\n• **Cultural fit**: How your values align with theirs\n\n**Pro Tips:**\n• Set up Google Alerts for company news\n• Follow company leaders on social media\n• Read recent earnings calls or press releases\n• Prepare specific examples of how you can contribute"
    }

    if (input.includes("bring to interview") || input.includes("what to bring")) {
      return "Being prepared with the right materials shows professionalism! Here's your interview checklist:\n\n**Essential Documents:**\n• **Resume**: 3-5 copies, printed on quality paper\n• **Cover Letter**: If you submitted one\n• **Portfolio**: Work samples, if relevant to your field\n• **References**: List of professional references with contact info\n\n**Preparation Materials:**\n• **Company Research**: Notes about the company, role, and industry\n• **Questions**: Your prepared questions for the interviewer\n• **Notepad & Pen**: For taking notes during the interview\n• **Directions**: Company address, parking info, building access\n\n**Professional Items:**\n• **Business Cards**: If you have them\n• **ID**: For building access or security\n• **Cash/Card**: For parking, transportation, or emergencies\n• **Phone**: Fully charged, but keep it on silent\n\n**What NOT to Bring:**\n• **Food or drinks** (unless it's a lunch interview)\n• **Large bags or backpacks**\n• **Personal items** that could be distracting\n• **Multiple devices** or electronics\n\n**Pro Tips:**\n• Pack everything the night before\n• Test your portfolio or samples beforehand\n• Have a backup plan for transportation\n• Arrive 10-15 minutes early\n• Keep your materials organized and easily accessible"
    }

    if (input.includes("salary questions") || input.includes("salary early") || input.includes("compensation")) {
      return "Handling salary questions early requires strategy! Here's how to navigate this:\n\n**If Asked Early (Before You're Ready):**\n• **Deflect Politely**: 'I'd like to learn more about the role and responsibilities first.'\n• **Ask for Range**: 'What's the salary range for this position?'\n• **Focus on Fit**: 'I'm more interested in finding the right role and company fit.'\n• **Buy Time**: 'I'd prefer to discuss compensation after understanding the full scope.'\n\n**If You Must Answer:**\n• **Give a Range**: 'Based on my research, I'm looking in the range of X to Y.'\n• **Be Flexible**: 'I'm open to discussing the total compensation package.'\n• **Show Research**: 'I've researched market rates for this role in this area.'\n• **Consider Benefits**: 'I'd like to understand the full package including benefits.'\n\n**Strategic Responses:**\n• 'I'm confident we can find a compensation package that works for both of us.'\n• 'I'd like to understand the role better before discussing specific numbers.'\n• 'What's the typical range for someone with my experience in this role?'\n• 'I'm open to discussing compensation once we both feel this is a good fit.'\n\n**Pro Tips:**\n• Research market rates beforehand\n• Consider the entire package, not just salary\n• Don't give your current salary unless required\n• Be prepared to justify your range with achievements\n• Remember: You're also evaluating if this role is right for you"
    }

    if (input.includes("signs interview went well") || input.includes("interview success") || input.includes("good interview")) {
      return "Great question! Here are positive signs that your interview went well:\n\n**During the Interview:**\n• **Time**: Interview runs longer than scheduled\n• **Engagement**: Interviewer seems genuinely interested and asks follow-up questions\n• **Body Language**: Positive, open posture, nodding, smiling\n• **Conversation Flow**: Natural, two-way conversation, not just Q&A\n• **Specific Questions**: They ask about your availability, start date, or next steps\n\n**Questions They Ask:**\n• 'When could you start?'\n• 'What are your salary expectations?'\n• 'Do you have any other offers or interviews?'\n• 'How do you feel about the role and company?'\n• 'What questions do you have for us?'\n\n**What They Share:**\n• **Company Details**: More information than necessary\n• **Team Information**: Introducing you to team members\n• **Next Steps**: Clear timeline for decisions\n• **Enthusiasm**: Positive comments about your background\n• **Cultural Fit**: Comments about how you'd fit in\n\n**Pro Tips:**\n• Don't read too much into any single sign\n• Focus on the overall feeling and engagement\n• Send a thank-you email regardless of how it went\n• Continue your job search until you have an offer\n• Remember: Sometimes great interviews don't lead to offers, and that's okay!\n\n**Red Flags to Watch For:**\n• Interviewer seems distracted or disinterested\n• Very short interview with no follow-up questions\n• Vague answers about next steps\n• Negative comments about the company or role"
    }

    // Default response with more helpful guidance
    return "That's a great question! I'm here to help you with all aspects of your career journey. Based on your question, here are some areas I can assist with:\n\n**Interview Preparation:**\n• Behavioral questions and STAR method\n• Technical interview strategies\n• Common interview questions and answers\n• Confidence building and preparation tips\n\n**Job Applications:**\n• Resume optimization and ATS tips\n• Cover letter writing\n• Application strategies\n• Follow-up techniques\n\n**Career Development:**\n• Skill development planning\n• Industry insights and trends\n• Networking strategies\n• Long-term career planning\n\nWhat specific area would you like to dive deeper into? I can provide detailed guidance, examples, and actionable steps!"
  }

  const handleQuickAction = async (action) => {
    if (action === "mock-interview") {
      // Generate a dynamic mock interview question using Gemini
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'mock-interview-question',
            data: {
              role: 'Software Engineer', // Default, could be made dynamic
              industry: 'Technology',
              difficulty: 'Intermediate'
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          const question = data.question
          // Add the message directly to avoid recursive sendMessage calls
          const userMessage = {
            id: Date.now(),
            type: "user",
            content: "I'd like to start a mock interview session. Can you help me practice?",
            timestamp: new Date(),
          }
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `Let's practice! Here's your mock interview question:\n\n${question}\n\nTake your time to think and respond. I'll provide feedback on your answer.`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, userMessage, aiMessage])
          await saveChatToHistory(userMessage.content, aiMessage.content)
        } else {
          sendMessage("I'd like to start a mock interview session. Can you help me practice?")
        }
      } catch (error) {
        sendMessage("I'd like to start a mock interview session. Can you help me practice?")
      }
    } else if (action === "insights") {
      // Get industry insights using Gemini
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'industry-insights',
            data: {
              industry: 'Technology',
              role: 'Software Engineer'
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          const insights = data.insights
          // Add the message directly to avoid recursive sendMessage calls
          const userMessage = {
            id: Date.now(),
            type: "user",
            content: "Tell me about current trends in my industry for interviews.",
            timestamp: new Date(),
          }
          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `Here are current industry insights for your field:\n\n${insights}`,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, userMessage, aiMessage])
          await saveChatToHistory(userMessage.content, aiMessage.content)
        } else {
          sendMessage("Tell me about current trends in my industry for interviews.")
        }
      } catch (error) {
        sendMessage("Tell me about current trends in my industry for interviews.")
      }
    } else {
    const actionMessages = {
      tips: "Can you give me some personalized interview tips based on my profile?",
      questions: "Show me some common interview questions I should prepare for.",
        "job-application": "I need help with my job application. Can you guide me through resume optimization, cover letter writing, and application strategies?",
        "career-planning": "I want to plan my long-term career path. Can you help me assess my current situation and create a strategic development plan?",
    }

    sendMessage(actionMessages[action])
    }
  }

  const toggleVoiceRecording = () => {
    if (!recognition) {
      const errorMessage = {
        id: Date.now(),
        type: "ai",
        content: "Voice recognition is not supported in your browser. Please type your message instead.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }
    
    if (isRecording) {
      stopVoiceRecording()
    } else {
      startVoiceRecording()
    }
  }

  const startVoiceRecording = () => {
    try {
      recognition.start()
    } catch (error) {
      console.error('Error starting voice recognition:', error)
      setIsRecording(false)
    }
  }

  const stopVoiceRecording = () => {
    try {
      recognition.stop()
    } catch (error) {
      console.error('Error stopping voice recognition:', error)
    }
    setIsRecording(false)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="min-h-[800px] h-[90vh] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-serif">AI Career Assistant</CardTitle>
                    <CardDescription>Your comprehensive career development and interview preparation companion</CardDescription>
                    <div className="mt-1 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${recognition ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs text-muted-foreground">
                        {recognition ? 'Gemini AI Enabled' : 'Using Local Knowledge'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-8" ref={scrollAreaRef}>
                  <div className="space-y-6 pb-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.type === "ai" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                          className={`max-w-[80%] rounded-lg px-6 py-4 ${
                          message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                          {message.type === "user" ? (
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          ) : (
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Customize markdown components for better styling
                                  h1: ({children}) => <h1 className="text-lg font-bold mb-3 text-foreground">{children}</h1>,
                                  h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                                  h3: ({children}) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
                                  p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                                  ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-2 ml-2">{children}</ul>,
                                  ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-2 ml-2">{children}</ol>,
                                  li: ({children}) => <li className="text-sm leading-relaxed">{children}</li>,
                                  strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                                  em: ({children}) => <em className="italic">{children}</em>,
                                  code: ({children}) => <code className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground">{children}</code>,
                                  blockquote: ({children}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">{children}</blockquote>,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        <p
                          className={`text-xs mt-1 ${
                            message.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.type === "user" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                          <span className="text-xs font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div
                            className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              </div>

              <Separator />

              {/* Input */}
              <div className="p-8 flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50 border-t">
                <div className="max-w-4xl mx-auto">
                  {/* Main Input Row */}
                  <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-lg">
                    {/* Input Field */}
                    <div className="flex-1 px-6 py-4">
                      <input
                      ref={inputRef}
                        type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                            e.preventDefault()
                            toggleVoiceRecording()
                          }
                        }}
                        placeholder="Ask me anything about interviews, job applications, career development, or professional growth..."
                        className="w-full outline-none text-gray-700 placeholder-gray-400 text-sm"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 px-3 py-2">
                      {/* Voice Button */}
                      <button
                        onClick={toggleVoiceRecording}
                        disabled={!recognition}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          isRecording
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-md'
                            : recognition
                            ? 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={
                          !recognition
                            ? "Voice recognition not supported"
                            : isRecording
                            ? "Stop recording (Ctrl+M)"
                            : "Start voice recording (Ctrl+M)"
                        }
                      >
                        <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
                      </button>
                      
                      {/* Send Button */}
                      <button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim() || isTyping || isRecording}
                        className={`p-2 rounded-xl transition-all duration-200 ${
                          inputValue.trim() && !isTyping && !isRecording
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Voice Recording Status */}
                  {isRecording && (
                    <div className="mt-3 flex items-center justify-center gap-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Recording... Speak now</span>
                      <button
                        onClick={stopVoiceRecording}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Stop
                      </button>
                    </div>
                  )}
                  
                  {/* Help Text */}
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500">
                      💡 Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl+M</kbd> for voice input
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Quick Actions</CardTitle>
                <CardDescription>Get help with common interview topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 flex-shrink-0 text-gray-600" />
                      <div className="text-left">
                          <div className="font-medium text-sm text-gray-900">{action.title}</div>
                          <div className="text-xs text-gray-500">{action.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            

            {/* AI-Powered Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">AI-Powered Tools</CardTitle>
                <CardDescription>Powered by Gemini AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  className="w-full text-left p-3 rounded-lg border border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  onClick={() => {
                    setConversationContext({
                      type: 'resume-analysis',
                      data: {}
                    })
                    // Add the message directly to avoid recursive sendMessage calls
                    const userMessage = {
                      id: generateUniqueId(),
                      type: "user",
                      content: "I'd like to analyze my resume against a job description. Please paste your resume content first.",
                      timestamp: new Date(),
                    }
                    const aiMessage = {
                      id: generateUniqueId(),
                      type: "ai",
                      content: "I'd be happy to help you analyze your resume! To provide the most targeted feedback, I'll need:\n\n1. **Your resume content** (you can paste it here)\n2. **The job description** you're targeting\n\nOnce you share both, I can provide:\n• Key strengths that match the job requirements\n• Areas for improvement and optimization\n• ATS compatibility tips\n• Specific suggestions for better alignment\n• An overall match score\n\nPlease paste your resume and the job description, and I'll give you detailed, actionable feedback!",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, userMessage, aiMessage])
                    saveChatToHistory(userMessage.content, aiMessage.content)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 flex-shrink-0 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-sm text-gray-900">Resume Feedback</div>
                      <div className="text-xs text-gray-500">AI-powered analysis</div>
                    </div>
                  </div>
                </button>
                <button
                  className="w-full text-left p-3 rounded-lg border border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  onClick={() => {
                    setConversationContext({
                      type: 'cover-letter',
                      data: {}
                    })
                    // Add the message directly to avoid recursive sendMessage calls
                    const userMessage = {
                      id: generateUniqueId(),
                      type: "user",
                      content: "I'd like help writing a cover letter. What job title are you applying for?",
                      timestamp: new Date(),
                    }
                    const aiMessage = {
                      id: generateUniqueId(),
                      type: "ai",
                      content: "I can help you create a compelling cover letter! To generate the best template, I'll need:\n\n1. **Job title** you're applying for\n2. **Company name**\n3. **Your background** (experience, skills, achievements)\n\nOnce you provide these details, I can create:\n• A professional opening paragraph\n• Body paragraphs connecting your experience to the role\n• A strong closing with call to action\n• Customization tips for your specific situation\n\nShare the details and I'll craft a cover letter that helps you stand out!",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, userMessage, aiMessage])
                    saveChatToHistory(userMessage.content, aiMessage.content)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-sm text-gray-900">Cover Letter Help</div>
                      <div className="text-xs text-gray-500">AI-generated templates</div>
                    </div>
                  </div>
                </button>
                <button
                  className="w-full text-left p-3 rounded-lg border border-gray-200 bg-transparent hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  onClick={() => {
                    // Add the message directly to avoid recursive sendMessage calls
                    const userMessage = {
                      id: generateUniqueId(),
                      type: "user",
                      content: "What are the current trends and opportunities in my industry?",
                      timestamp: new Date(),
                    }
                    const aiMessage = {
                      id: generateUniqueId(),
                      type: "ai",
                      content: "I'd love to share current industry insights with you! To provide the most relevant information, let me know:\n\n1. **Your industry** (e.g., Technology, Healthcare, Finance)\n2. **Your role or target position** (e.g., Software Engineer, Data Scientist)\n\nI can then share:\n• Current market trends and opportunities\n• In-demand skills and technologies\n• Salary trends and compensation insights\n• Interview preparation tips for your field\n• Professional development recommendations\n\nWhat industry and role would you like insights on?",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, userMessage, aiMessage])
                    saveChatToHistory(userMessage.content, aiMessage.content)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 flex-shrink-0 text-gray-600" />
                    <div className="text-left">
                      <div className="text-sm text-gray-900">Industry Trends</div>
                      <div className="text-xs text-gray-500">Real-time insights</div>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
}
