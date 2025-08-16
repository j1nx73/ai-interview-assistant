import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

// Career coaching system prompt
const CAREER_COACH_PROMPT = `You are an expert career coach and interview preparation specialist with over 20 years of experience helping professionals succeed in their careers. You have deep knowledge of:

**Interview Preparation:**
- Behavioral interview techniques and STAR method
- Technical interview strategies for various industries
- Confidence building and nervousness management
- Common interview questions and best practices
- Company research and preparation strategies

**Job Applications:**
- Resume optimization and ATS compatibility
- Cover letter writing and customization
- Application strategies and follow-up techniques
- Phone screening and preliminary interview preparation
- Red flag identification in job postings

**Career Development:**
- Long-term career planning and goal setting
- Skill development and gap analysis
- Industry trends and market insights
- Networking strategies and relationship building
- Salary negotiation and compensation planning

**Professional Growth:**
- Leadership development and management skills
- Industry transitions and career pivots
- Personal branding and thought leadership
- Work-life balance and professional well-being
- Continuous learning and skill enhancement

**Your Approach:**
- Provide specific, actionable advice with concrete examples
- Use a warm, encouraging, and professional tone
- Structure responses with clear headings and bullet points
- Include pro tips and best practices
- Ask clarifying questions when needed
- Provide step-by-step guidance for complex topics
- Use real-world examples and scenarios
- Encourage continuous learning and growth

**Response Format:**
- Start with a brief acknowledgment of the question
- Provide comprehensive, structured guidance
- Include specific examples and templates when relevant
- End with actionable next steps or follow-up questions
- Keep responses informative but concise (2-4 paragraphs)
- Use markdown formatting for better readability

Remember: You're not just answering questions - you're coaching and mentoring users to achieve their career goals. Be encouraging, practical, and always focused on helping them succeed.`

export interface GeminiResponse {
  text: string
  usage: {
    promptTokens: number
    responseTokens: number
    totalTokens: number
  }
}

export class GeminiService {
  private model: any

  constructor() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        console.warn('Gemini API key not found. Voice features will use fallback responses.')
        this.model = null
        return
      }
      
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      console.log('Gemini model initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Gemini model:', error)
      this.model = null
    }
  }

  async generateCareerAdvice(userQuestion: string, context?: string): Promise<GeminiResponse> {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.')
    }

    try {
      const prompt = `${CAREER_COACH_PROMPT}

**User Question:** ${userQuestion}

${context ? `**Context:** ${context}` : ''}

Please provide comprehensive, actionable career advice based on the user's question. Focus on practical steps, specific examples, and encouraging guidance that will help them succeed.`

      const result = await this.model.generateContent(prompt)
      
      if (!result || !result.response) {
        throw new Error('Invalid response from Gemini API')
      }
      
      const response = await result.response
      
      if (!response.text) {
        throw new Error('No text content in Gemini response')
      }
      
      const text = response.text()

      // Extract usage information if available
      const usage = {
        promptTokens: 0,
        responseTokens: 0,
        totalTokens: 0
      }

      return {
        text,
        usage
      }
    } catch (error) {
      console.error('Error generating Gemini response:', error)
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.')
      } else if (error.message?.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later.')
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your internet connection.')
      } else {
        throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`)
      }
    }
  }

  async generateMockInterviewQuestion(role: string, industry: string, difficulty: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized')
    }

    try {
      const prompt = `Generate a realistic interview question for a ${role} position in the ${industry} industry. The question should be ${difficulty} difficulty level.

Please provide:
1. The interview question
2. What the interviewer is looking for
3. A brief tip on how to approach the answer

Keep it concise and practical.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating mock interview question:', error)
      return 'Tell me about a challenging project you worked on and how you overcame obstacles.'
    }
  }

  async analyzeResumeFeedback(resumeText: string, jobDescription: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized')
    }

    try {
      const prompt = `Analyze this resume against the job description and provide specific feedback:

**Resume:**
${resumeText}

**Job Description:**
${jobDescription}

Please provide:
1. Key strengths that match the job requirements
2. Areas for improvement
3. Specific suggestions for optimization
4. ATS compatibility tips
5. Overall match score (1-10) with justification

Keep the feedback constructive and actionable.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error analyzing resume:', error)
      return 'Unable to analyze resume at this time. Please try again.'
    }
  }

  async generateCoverLetterTemplate(jobTitle: string, company: string, userBackground: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized')
    }

    try {
      const prompt = `Create a professional cover letter template for a ${jobTitle} position at ${company}.

**User Background:**
${userBackground}

Please provide:
1. A compelling opening paragraph
2. 2-3 body paragraphs connecting experience to the role
3. A strong closing paragraph
4. Tips for customization

Make it professional, engaging, and tailored to the specific role and company.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating cover letter template:', error)
      return 'Unable to generate cover letter template at this time. Please try again.'
    }
  }

  async getIndustryInsights(industry: string, role: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized')
    }

    try {
      const prompt = `Provide current industry insights and trends for ${role} positions in the ${industry} industry.

Please include:
1. Current market trends and opportunities
2. In-demand skills and technologies
3. Salary trends and compensation insights
4. Interview preparation tips specific to this industry
5. Professional development recommendations

Focus on actionable insights that will help someone prepare for interviews and advance their career in this field.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error getting industry insights:', error)
      return 'Unable to retrieve industry insights at this time. Please try again.'
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService()
