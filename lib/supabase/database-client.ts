import { createClient } from './client'

// Types for our database
export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'premium' | 'admin'
  subscription_tier: string | null
  subscription_expires_at: string | null
  timezone: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface InterviewSession {
  id: string
  user_id: string
  title: string
  description: string | null
  category: 'behavioral' | 'technical' | 'leadership' | 'general'
  status: 'completed' | 'in_progress' | 'abandoned'
  duration_minutes: number
  score_percentage: number | null
  feedback_summary: string | null
  created_at: string
  completed_at: string | null
  updated_at: string
}

export interface Question {
  id: string
  text: string
  category: 'behavioral' | 'technical' | 'leadership' | 'general'
  difficulty: string
  tips: string[]
  sample_answer: string | null
  created_at: string
  updated_at: string
}

export interface SessionQuestion {
  id: string
  session_id: string
  question_id: string
  user_answer: string | null
  ai_feedback: string | null
  score_percentage: number | null
  response_time_seconds: number | null
  created_at: string
}

export interface SpeechAnalysis {
  id: string
  user_id: string
  session_id: string | null
  audio_file_url: string | null
  transcript: string | null
  confidence_score: number | null
  speaking_rate_wpm: number | null
  filler_words_count: number | null
  sentiment_analysis: Record<string, any> | null
  improvement_suggestions: string[] | null
  created_at: string
}

export interface ResumeAnalysis {
  id: string
  user_id: string
  resume_file_url: string | null
  job_title: string | null
  company: string | null
  match_score: number | null
  strengths: string[] | null
  weaknesses: string[] | null
  suggestions: string[] | null
  keywords_found: string[] | null
  keywords_missing: string[] | null
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  category: 'behavioral' | 'technical' | 'leadership' | 'general'
  total_sessions: number
  total_questions: number
  average_score: number
  best_score: number
  time_spent_minutes: number
  last_practiced_at: string | null
  created_at: string
  updated_at: string
}

// Client-side database service
export class DatabaseServiceClient {
  private supabase

  constructor() {
    this.supabase = createClient()
  }

  // User Profile Methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  }

  // Interview Session Methods
  async createInterviewSession(session: Omit<InterviewSession, 'id' | 'created_at' | 'updated_at'>): Promise<InterviewSession | null> {
    const { data, error } = await this.supabase
      .from('interview_sessions')
      .insert(session)
      .select()
      .single()

    if (error) {
      console.error('Error creating interview session:', error)
      return null
    }

    return data
  }

  async getInterviewSessions(userId: string): Promise<InterviewSession[]> {
    const { data, error } = await this.supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching interview sessions:', error)
      return []
    }

    return data || []
  }

  async updateInterviewSession(sessionId: string, updates: Partial<InterviewSession>): Promise<InterviewSession | null> {
    const { data, error } = await this.supabase
      .from('interview_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating interview session:', error)
      return null
    }

    return data
  }

  async deleteInterviewSession(sessionId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('interview_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Error deleting interview session:', error)
      return false
    }

    return true
  }

  // Question Methods
  async getQuestions(category?: string, difficulty?: string): Promise<Question[]> {
    let query = this.supabase
      .from('questions')
      .select('*')

    if (category) {
      query = query.eq('category', category)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching questions:', error)
      return []
    }

    return data || []
  }

  async getRandomQuestions(category: string, count: number = 5): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(count)

    if (error) {
      console.error('Error fetching random questions:', error)
      return []
    }

    // Shuffle the results
    return (data || []).sort(() => Math.random() - 0.5)
  }

  // Session Question Methods
  async createSessionQuestion(question: Omit<SessionQuestion, 'id' | 'created_at'>): Promise<SessionQuestion | null> {
    const { data, error } = await this.supabase
      .from('session_questions')
      .insert(question)
      .select()
      .single()

    if (error) {
      console.error('Error creating session question:', error)
      return null
    }

    return data
  }

  async getSessionQuestions(sessionId: string): Promise<SessionQuestion[]> {
    const { data, error } = await this.supabase
      .from('session_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching session questions:', error)
      return []
    }

    return data || []
  }

  // Speech Analysis Methods
  async createSpeechAnalysis(analysis: Omit<SpeechAnalysis, 'id' | 'created_at'>): Promise<SpeechAnalysis | null> {
    const { data, error } = await this.supabase
      .from('speech_analysis')
      .insert(analysis)
      .select()
      .single()

    if (error) {
      console.error('Error creating speech analysis:', error)
      return null
    }

    return data
  }

  async getSpeechAnalysis(userId: string): Promise<SpeechAnalysis[]> {
    const { data, error } = await this.supabase
      .from('speech_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching speech analysis:', error)
      return []
    }

    return data || []
  }

  // Resume Analysis Methods
  async createResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<ResumeAnalysis | null> {
    const { data, error } = await this.supabase
      .from('resume_analysis')
      .insert(analysis)
      .select()
      .single()

    if (error) {
      console.error('Error creating resume analysis:', error)
      return null
    }

    return data
  }

  async getResumeAnalysis(userId: string): Promise<ResumeAnalysis[]> {
    const { data, error } = await this.supabase
      .from('resume_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching resume analysis:', error)
      return []
    }

    return data || []
  }

  // User Progress Methods
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching user progress:', error)
      return []
    }

    return data || []
  }

  async updateUserProgress(userId: string, category: string, updates: Partial<UserProgress>): Promise<UserProgress | null> {
    const { data, error } = await this.supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('category', category)
      .select()
      .single()

    if (error) {
      console.error('Error updating user progress:', error)
      return null
    }

    return data
  }

  // Analytics Methods
  async getUserStats(userId: string) {
    const [sessions, speechAnalysis, resumeAnalysis] = await Promise.all([
      this.getInterviewSessions(userId),
      this.getSpeechAnalysis(userId),
      this.getResumeAnalysis(userId)
    ])

    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'completed').length
    const averageScore = sessions.length > 0 
      ? sessions.reduce((acc, s) => acc + (s.score_percentage || 0), 0) / sessions.length 
      : 0

    const totalSpeechAnalysis = speechAnalysis.length
    const totalResumeAnalysis = resumeAnalysis.length

    return {
      totalSessions,
      completedSessions,
      averageScore: Math.round(averageScore * 100) / 100,
      totalSpeechAnalysis,
      totalResumeAnalysis,
      successRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
    }
  }

  // Search Methods
  async searchQuestions(query: string, category?: string): Promise<Question[]> {
    let supabaseQuery = this.supabase
      .from('questions')
      .select('*')
      .or(`text.ilike.%${query}%,category.ilike.%${query}%`)

    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching questions:', error)
      return []
    }

    return data || []
  }
}

// Export singleton instance for client-side use
export const dbClient = new DatabaseServiceClient()
