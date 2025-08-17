# 🎯 AI Interview Assistant

A comprehensive AI-powered interview preparation platform that helps users ace their job interviews through speech analysis, resume feedback, and intelligent career coaching.

## 🚀 **Features**

### 🎯 **Core Functionality**
- **Speech Analysis**: Real-time feedback on speaking patterns and confidence
- **Resume Optimization**: AI-powered resume analysis and improvement suggestions
- **Interview Training**: Comprehensive question bank with difficulty levels
- **AI Chat Assistant**: Intelligent interview coaching and practice
- **Progress Tracking**: Detailed analytics and improvement metrics
- **Export & Reports**: Downloadable session transcripts and analysis

### 🔧 **Technical Features**
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Real-time Processing**: Instant feedback and analysis
- **Cross-platform**: Works on desktop and mobile devices
- **Performance Optimized**: Fast loading and smooth interactions

## 🚀 Quick Start

### 1. **Clone & Install**
```bash
git clone <your-repo-url>
cd ai-interview-assistant
npm install
```

### 2. **Environment Setup**
Create a `.env.local` file with your API keys:
```bash
# Google Cloud Speech-to-Text API (Optional)
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_CLOUD_PRIVATE_KEY=your-google-cloud-private-key
GOOGLE_CLOUD_CLIENT_EMAIL=your-google-cloud-client-email

# Gemini AI API (Optional)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. **Run the Application**
```bash
npm run dev
```

### 4. **Access the App**
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: This application runs without user authentication. All features are available immediately without login requirements.

## 🛠️ Configuration

### **Google Cloud Speech-to-Text API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Speech-to-Text API
4. Create a service account and download the JSON credentials
5. Add the credentials to your `.env.local` file

### **Gemini AI API**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local` file

### **Optional Features**
- **Speech Analysis**: Requires Google Cloud Speech-to-Text API
- **AI Chat**: Requires Gemini AI API
- **Resume Analysis**: Works offline with basic features

## 📱 Usage Guide

### **Getting Started**
1. **Open the Application**: Navigate to the dashboard
2. **Choose a Feature**: Select from speech analysis, resume review, or AI chat
3. **Start Practicing**: Begin your interview preparation journey

### **Speech Analysis**
1. Navigate to **Speech Analysis**
2. Select a question category (behavioral, technical, leadership)
3. Click **Start Recording** and answer the question
4. Review your performance metrics and feedback
5. Practice again to improve your scores

### **Resume Analysis**
1. Go to **Resume Analysis**
2. Upload your resume (PDF, DOC, or TXT)
3. Review AI-generated feedback and suggestions
4. Implement improvements and re-analyze

### **AI Chat Assistant**
1. Visit **Chat Bot**
2. Ask questions about interviews, career advice, or resume tips
3. Get instant AI-powered responses
4. Use voice input for hands-free interaction

### **Progress Tracking**
- Monitor your improvement over time
- View detailed analytics and metrics
- Export your session data and transcripts

## 🏗️ Project Structure

```
ai-interview-assistant/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── gemini/        # Gemini AI integration
│   │   └── speech-to-text/ # Speech processing API
│   ├── chat-bot/          # AI chat interface
│   ├── dashboard/         # Main dashboard
│   ├── export/            # Data export functionality
│   ├── progress/          # Progress tracking
│   ├── resume-analysis/   # Resume analysis tool
│   ├── speech-analysis/   # Speech practice interface
│   ├── train/             # Training exercises
│   └── transcript/        # Session transcripts
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── sidebar.tsx        # Navigation sidebar
│   └── layout-wrapper.tsx # Layout wrapper component
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── gemini-service.ts  # Gemini AI service
│   ├── google-cloud-speech.ts # Speech-to-text service
│   └── pdf-export.ts      # PDF export functionality
├── public/                 # Static assets
└── styles/                 # Global styles
```

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 13+**: React framework with app directory
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Shadcn/UI**: Beautiful, accessible UI components

### **AI & APIs**
- **Google Gemini AI**: Intelligent chat and career guidance
- **Google Cloud Speech-to-Text**: Real-time speech recognition
- **OpenAI Whisper**: Alternative speech processing

### **Utilities**
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **Lucide React**: Beautiful icons
- **PDF Export**: Session data export functionality

## 🔧 Development

### Available Scripts

```