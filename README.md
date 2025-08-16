# 🎯 AI Interview Assistant

A comprehensive AI-powered interview preparation platform that helps users ace their job interviews through speech analysis, resume feedback, and intelligent career coaching.

## ✨ Features

### 🤖 **AI-Powered Chat Bot**
- **Google Gemini AI Integration**: Intelligent responses for career questions
- **Multi-turn Conversations**: Contextual discussions for resume analysis and cover letters
- **Voice-to-Text**: Speak your questions instead of typing
- **Markdown Rendering**: Beautiful formatting for AI responses
- **Career Guidance**: Expert advice on interviews, job applications, and career development

### 🎤 **Speech Analysis**
- **Real-time Speech Recognition**: Practice interview questions with voice input
- **Advanced Metrics**: Clarity, pace, confidence, filler words, speaking rate
- **Question Bank**: Categorized questions (behavioral, technical, situational)
- **Progress Tracking**: Monitor improvement over time
- **Detailed Recommendations**: Actionable tips for improvement

### 📄 **Resume Analysis**
- **Comprehensive Feedback**: Analysis of all resume sections
- **ATS Optimization**: Improve your resume's Applicant Tracking System score
- **Job Matching**: Compare your resume against specific job descriptions
- **Skill Gap Analysis**: Identify areas for improvement
- **Industry-Specific Advice**: Tailored recommendations by industry and experience level

### 🔐 **Authentication & Security**
- **Supabase Integration**: Secure user authentication and data storage
- **Row Level Security**: User data isolation and protection
- **Session Management**: Persistent login across browser sessions

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18.17 or higher
- **npm** or **pnpm**: Package manager
- **Git**: Version control system

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ai-interview-assistant
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Google Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Database Setup

#### Option A: Run the Master Script (Recommended)
1. Go to your Supabase dashboard → **SQL Editor**
2. Copy and paste the contents of `scripts/run_setup.sql`
3. Click "Run" to execute all scripts at once

#### Option B: Run Scripts Individually
1. Run `scripts/01_create_tables.sql` first
2. Then run `scripts/02_create_functions.sql`

#### Option C: If You Encounter Errors
1. Run `scripts/01_create_tables.sql` first
2. Then run `scripts/02_create_functions.sql`
3. If the `check_setup_status` function is missing, run `scripts/fix_check_setup.sql`
4. Use `scripts/simple_verification.sql` to verify the setup

### 5. Run the Application
```bash
npm run dev
# or
pnpm dev
```

The application will be available at: **http://localhost:3000**

## 🛠️ Configuration

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Authentication**
   - Go to **Authentication** → **Settings**
   - Set your site URL to `http://localhost:3000`
   - Add redirect URL: `http://localhost:3000/dashboard`

3. **Database Schema**
   - The SQL scripts will automatically create:
     - User profiles table
     - Chat history table
     - Speech records table
     - Resume analysis table
     - User settings table
     - Row Level Security policies
     - Triggers for automatic profile creation

### Google Gemini AI Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Add it to your `.env.local` file

2. **Features Available**
   - Career advice generation
   - Mock interview questions
   - Resume feedback
   - Cover letter templates
   - Industry insights

## 📱 Usage Guide

### Getting Started

1. **First Visit**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to the login page
   - Create an account or sign in

2. **Dashboard**
   - Overview of your progress
   - Quick access to all features
   - Recent activity and statistics

### Using the Chat Bot

1. **Access Chat Bot**
   - Click "Chat Bot" in the sidebar
   - Or navigate to `/chat-bot`

2. **Ask Questions**
   - Type your career-related questions
   - Use voice input with the microphone button
   - Get AI-powered responses from Gemini

3. **Quick Actions**
   - Resume feedback requests
   - Cover letter help
   - Industry trend insights
   - Mock interview questions

### Speech Analysis

1. **Start Recording**
   - Go to `/speech-analysis`
   - Select a question category
   - Click the microphone to start recording

2. **Practice Questions**
   - Answer behavioral, technical, or situational questions
   - Get real-time feedback on your speech

3. **Review Results**
   - Analyze clarity, pace, and confidence scores
   - View detailed recommendations
   - Track your progress over time

### Resume Analysis

1. **Upload Resume**
   - Go to `/resume-analysis`
   - Upload a PDF or paste text content
   - Select industry and experience level

2. **Get Feedback**
   - Section-by-section analysis
   - ATS optimization tips
   - Readability scores
   - General improvement suggestions

3. **Job Matching**
   - Paste job descriptions
   - Get match scores
   - Identify skill gaps
   - Receive targeted recommendations

## 🏗️ Project Structure

```
ai-interview-assistant/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   └── gemini/             # Gemini AI API endpoint
│   ├── chat-bot/               # Chat bot page
│   ├── dashboard/               # Dashboard page
│   ├── login/                   # Authentication pages
│   ├── resume-analysis/         # Resume analysis page
│   ├── speech-analysis/         # Speech analysis page
│   └── layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                      # Shadcn/UI components
│   ├── sidebar.tsx              # Navigation sidebar
│   └── layout-wrapper.tsx       # Conditional layout wrapper
├── lib/                         # Utility libraries
│   ├── supabase/                # Supabase client configuration
│   ├── gemini-service.ts        # Gemini AI service
│   └── auth-context.tsx         # Authentication context
├── scripts/                     # Database setup scripts
│   ├── 01_create_tables.sql     # Database schema
│   ├── 02_create_functions.sql  # Database functions
│   ├── run_setup.sql            # Master setup script
│   └── test_setup.sql           # Verification script
├── styles/                       # Global styles
└── package.json                  # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: Google Gemini AI
- **Speech**: Web Speech API
- **State Management**: React Context API

### Key Dependencies

```json
{
  "@google/generative-ai": "^0.16.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-markdown": "^9.0.2",
  "remark-gfm": "^4.0.0",
  "@supabase/ssr": "latest",
  "tailwindcss": "latest",
  "lucide-react": "latest"
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Port Already in Use**
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

#### 2. **Supabase Connection Issues**
- Verify your environment variables
- Check if your Supabase project is active
- Ensure RLS policies are properly configured

#### 3. **Gemini AI Not Working**
- Verify your API key is correct
- Check if you have sufficient quota
- Ensure the API key is properly set in `.env.local`

#### 4. **Database Setup Errors**
- Run `scripts/simple_verification.sql` to check setup
- Use `scripts/fix_check_setup.sql` if functions are missing
- Check Supabase logs for detailed error messages

#### 5. **Speech Recognition Issues**
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check microphone permissions
- Try refreshing the page if recognition fails

### Error Logs

Check these locations for error information:
- **Browser Console**: JavaScript errors and API responses
- **Terminal**: Next.js server logs
- **Supabase Dashboard**: Database and authentication logs

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables for Production

```bash
# Update .env.local with production values
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com/dashboard
```

### Deployment Platforms

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment option
- **AWS/GCP**: For custom server deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for backend infrastructure
- **Google Gemini AI** for intelligent responses
- **Shadcn/UI** for beautiful components
- **Next.js** for the amazing framework
- **Tailwind CSS** for utility-first styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the Supabase setup documentation
3. Check browser console for error messages
4. Verify all environment variables are set correctly

---

**Happy Interview Preparation! 🎯✨**

*Built with ❤️ using Next.js, Supabase, and Google Gemini AI*
