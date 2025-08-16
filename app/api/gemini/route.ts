import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini-service'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    hasGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    geminiServiceStatus: geminiService ? 'initialized' : 'not initialized'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'career-advice':
        const { question, context } = data
        if (!question) {
          return NextResponse.json(
            { error: 'Question is required' },
            { status: 400 }
          )
        }
        
        const advice = await geminiService.generateCareerAdvice(question, context)
        return NextResponse.json(advice)

      case 'mock-interview-question':
        const { role: mockRole, industry: mockIndustry, difficulty } = data
        if (!mockRole || !mockIndustry || !difficulty) {
          return NextResponse.json(
            { error: 'Role, industry, and difficulty are required' },
            { status: 400 }
          )
        }
        
        const mockQuestion = await geminiService.generateMockInterviewQuestion(mockRole, mockIndustry, difficulty)
        return NextResponse.json({ question: mockQuestion })

      case 'resume-feedback':
        const { resumeText, jobDescription } = data
        if (!resumeText || !jobDescription) {
          return NextResponse.json(
            { error: 'Resume text and job description are required' },
            { status: 400 }
          )
        }
        
        const feedback = await geminiService.analyzeResumeFeedback(resumeText, jobDescription)
        return NextResponse.json({ feedback })

      case 'cover-letter-template':
        const { jobTitle, company, userBackground } = data
        if (!jobTitle || !company || !userBackground) {
          return NextResponse.json(
            { error: 'Job title, company, and user background are required' },
            { status: 400 }
          )
        }
        
        const template = await geminiService.generateCoverLetterTemplate(jobTitle, company, userBackground)
        return NextResponse.json({ template })

      case 'industry-insights':
        const { industry: insightsIndustry, role: insightsRole } = data
        if (!insightsIndustry || !insightsRole) {
          return NextResponse.json(
            { error: 'Industry and role are required' },
            { status: 400 }
          )
        }
        
        const insights = await geminiService.getIndustryInsights(insightsIndustry, insightsRole)
        return NextResponse.json({ insights })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
