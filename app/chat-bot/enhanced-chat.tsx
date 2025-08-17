"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { 
  Send, 
  Mic, 
  MicOff, 
  Download, 
  History, 
  MessageSquare, 
  Brain, 
  Loader2, 
  Sparkles, 
  Zap,
  Clock,
  User,
  Bot,
  Trash2,
  RefreshCw
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  conversationId: string
}

interface Conversation {
  id: string
  title: string
  createdAt: Date
  messageCount: number
}

export default function EnhancedChatPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  // Load conversations from localStorage on mount
  useEffect(() => {
    loadConversationsFromStorage()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversationsFromStorage = () => {
    try {
      const stored = localStorage.getItem('chat-conversations')
      if (stored) {
        const parsed = JSON.parse(stored)
        setConversations(parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
        })))
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const saveConversationsToStorage = (conversations: Conversation[]) => {
    try {
      localStorage.setItem('chat-conversations', JSON.stringify(conversations))
    } catch (error) {
      console.error('Error saving conversations:', error)
    }
  }

  const saveMessagesToStorage = (messages: Message[]) => {
    try {
      localStorage.setItem(`chat-messages-${currentConversationId}`, JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving messages:', error)
    }
  }

  const loadMessagesFromStorage = (conversationId: string) => {
    try {
      const stored = localStorage.getItem(`chat-messages-${conversationId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })))
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast({
          title: "Listening...",
          description: "Speak your message now.",
        })
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        toast({
          title: "Speech Recognition Failed",
          description: "Please check your microphone permissions.",
          variant: "destructive",
        })
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      createdAt: new Date(),
      messageCount: 0
    }
    
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setMessages([])
    setShowHistory(false)
    
    saveConversationsToStorage([newConversation, ...conversations])
  }

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id)
    loadMessagesFromStorage(conversation.id)
    setShowHistory(false)
  }

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    localStorage.removeItem(`chat-messages-${conversationId}`)
    
    if (currentConversationId === conversationId) {
      createNewConversation()
    }
    
    saveConversationsToStorage(conversations.filter(conv => conv.id !== conversationId))
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
      conversationId: currentConversationId
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Save message to localStorage
    const updatedMessages = [...messages, userMessage]
    saveMessagesToStorage(updatedMessages)

    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: `This is a mock AI response to: "${userMessage.content}". In a real implementation, this would be generated by the Gemini AI API.`,
        role: 'assistant',
        timestamp: new Date(),
        conversationId: currentConversationId
      }

      const finalMessages = [...updatedMessages, aiResponse]
      setMessages(finalMessages)
      saveMessagesToStorage(finalMessages)

      // Update conversation title and count
      if (conversations.length > 0) {
        const updatedConversations = conversations.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, title: userMessage.content.slice(0, 50) + '...', messageCount: finalMessages.length }
            : conv
        )
        setConversations(updatedConversations)
        saveConversationsToStorage(updatedConversations)
      }

    } catch (error) {
      console.error("Error getting AI response:", error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const exportConversation = () => {
    if (messages.length === 0) return
    
    const exportData = {
      conversationId: currentConversationId,
      title: conversations.find(c => c.id === currentConversationId)?.title || "Chat Conversation",
      messages: messages,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-conversation-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Successful",
      description: "Your conversation has been exported.",
    })
  }

  const clearConversation = () => {
    setMessages([])
    saveMessagesToStorage([])
    
    if (currentConversationId) {
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messageCount: 0 }
          : conv
      )
      setConversations(updatedConversations)
      saveConversationsToStorage(updatedConversations)
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
                onClick={createNewConversation}
                className="w-full justify-start gap-2 transition-all duration-200 hover:shadow-md"
                variant="outline"
              >
                <Sparkles className="h-4 w-4" />
                New Chat
              </Button>
            </motion.div>
          </motion.div>

          {/* Chat Sessions List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
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
                    onClick={() => selectConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 ${
                      currentConversationId === conversation.id ? 'bg-muted shadow-sm' : ''
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
                        <p className="text-sm font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.messageCount} messages • {new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteConversation(conversation.id)}
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
          <Tabs value={currentConversationId} onValueChange={setCurrentConversationId} className="flex-1 flex flex-col">
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
                  value="history" 
                  className="flex-1 transition-all duration-200 hover:bg-muted/50"
                >
                  History
                </TabsTrigger>
              </motion.div>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value={currentConversationId} className="flex-1 flex flex-col p-0">
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
                        true ? 'bg-green-500' : 
                        false ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        AI Service Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {}}
                        className="text-xs h-6 px-2"
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4" ref={messagesEndRef}>
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
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role !== 'user' && (
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
                          initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted/50 text-foreground'
                          }`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </motion.div>

                        {message.role === 'user' && (
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
                    
                    {isLoading && (
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
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask me anything about your career, interviews, or job search..."
                          className="min-h-[60px] resize-none pr-20 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 hover:bg-muted/30 focus:bg-muted/50"
                          onKeyDown={handleKeyPress}
                        />
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant={isListening ? "destructive" : "ghost"}
                              onClick={isListening ? stopListening : startListening}
                              className="h-8 w-8 p-0 transition-all duration-200"
                            >
                              {isListening ? (
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
                          onClick={sendMessage}
                          disabled={!inputValue.trim() || isLoading}
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

            {/* History Tab */}
            <TabsContent value="history" className="flex-1 p-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Chat History
                    </CardTitle>
                    <CardDescription>
                      View and manage your previous chat conversations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <label className="block text-sm font-medium mb-2">Conversation History</label>
                      <ScrollArea className="max-h-96 pr-2">
                        <div className="space-y-2">
                          {conversations.map((conversation, index) => (
                            <motion.div
                              key={conversation.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ 
                                duration: 0.3, 
                                delay: index * 0.1,
                                ease: "easeOut"
                              }}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm font-medium">{conversation.title}</p>
                              </div>
                              <Badge variant="secondary">{conversation.messageCount} messages</Badge>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Button 
                        onClick={clearConversation}
                        disabled={conversations.length === 0}
                        className="w-full transition-all duration-200 hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Conversations
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Button 
                        onClick={exportConversation}
                        disabled={messages.length === 0}
                        className="w-full transition-all duration-200 hover:scale-105"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Conversation
                      </Button>
                    </motion.div>
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
