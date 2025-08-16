import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  FileText,
  MessageSquare,
  Target,
  Zap,
  Brain,
  Shield,
  Globe,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  Star,
  Play,
  BookOpen,
  Lightbulb,
  Rocket,
  Heart,
  ArrowUpRight,
  Clock,
  BarChart3,
  Eye,
  Headphones,
  GraduationCap,
  Briefcase,
  UserCheck,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Interview Preparation Platform
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Master Your
              <span className="text-primary"> Interview Skills</span>
              <br />
              <span className="text-3xl md:text-4xl text-muted-foreground font-normal">
                with AI-Driven Analysis
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your interview performance with cutting-edge AI technology that provides 
              real-time feedback, speech analysis, and personalized coaching to help you land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  <Play className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                  <Target className="h-5 w-5" />
                  See How It Works
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              What We Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing interview preparation by combining advanced AI technology with proven 
              career development methodologies to create a comprehensive learning experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Speech Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced AI analyzes your speaking patterns, confidence levels, and communication clarity 
                  to provide actionable feedback for improvement.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">AI Interview Coach</h3>
                <p className="text-muted-foreground">
                  Personalized AI coaching that adapts to your learning style, provides industry-specific 
                  insights, and guides you through behavioral questions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Resume Optimization</h3>
                <p className="text-muted-foreground">
                  AI-powered resume analysis that identifies improvement opportunities, optimizes keywords, 
                  and ensures ATS compatibility for maximum visibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              How It Helps You Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform addresses the most common interview challenges and provides 
              systematic solutions to help you build confidence and improve performance.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">Build Confidence</h3>
                  <p className="text-muted-foreground">
                    Practice in a safe environment with instant feedback. Our AI identifies your strengths 
                    and areas for improvement, helping you develop confidence through targeted practice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground">
                    Monitor your improvement over time with detailed analytics and performance metrics. 
                    See exactly how you're progressing in confidence, clarity, and communication skills.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">Learn Best Practices</h3>
                  <p className="text-muted-foreground">
                    Access industry-specific tips, behavioral question frameworks, and proven strategies 
                    that successful candidates use to ace their interviews.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">Save Time</h3>
                  <p className="text-muted-foreground">
                    No more scheduling mock interviews or waiting for feedback. Get instant analysis 
                    and recommendations 24/7, allowing you to practice efficiently on your own schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">Data-Driven Insights</h3>
                  <p className="text-muted-foreground">
                    Receive objective, data-driven feedback on your performance. Our AI analyzes 
                    multiple dimensions of your answers to provide comprehensive improvement suggestions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold mb-2">Identify Blind Spots</h3>
                  <p className="text-muted-foreground">
                    Discover communication patterns and habits you might not be aware of. Our AI 
                    catches subtle issues that human reviewers might miss, giving you a complete picture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Who Is This For?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a recent graduate, career changer, or experienced professional, 
              our platform is designed to help anyone who wants to improve their interview skills.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Recent Graduates</h3>
                <p className="text-sm text-muted-foreground">
                  Build confidence for your first professional interviews with structured practice 
                  and industry-specific guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Career Changers</h3>
                <p className="text-sm text-muted-foreground">
                  Transition smoothly into new industries with targeted practice for behavioral 
                  questions and industry-specific scenarios.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Experienced Professionals</h3>
                <p className="text-sm text-muted-foreground">
                  Polish your interview skills for senior positions and executive roles with 
                  advanced coaching and leadership-focused scenarios.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-serif text-lg font-bold mb-2">Remote Job Seekers</h3>
                <p className="text-sm text-muted-foreground">
                  Master virtual interview skills with AI analysis of your video presence, 
                  communication clarity, and technical setup.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the powerful tools and capabilities that make our platform 
              the ultimate interview preparation solution.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Real-Time Speech Analysis</CardTitle>
                <CardDescription>
                  Get instant feedback on your speaking patterns, confidence, and communication clarity.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">AI Interview Coach</CardTitle>
                <CardDescription>
                  Personalized coaching that adapts to your learning style and career goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Resume Optimization</CardTitle>
                <CardDescription>
                  AI-powered analysis to make your resume stand out and pass ATS systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your improvement with detailed analytics and performance metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level security with end-to-end encryption and GDPR compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif">Multi-Platform Access</CardTitle>
                <CardDescription>
                  Practice anywhere with our responsive web platform and mobile-friendly design.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hear from real users who have transformed their interview skills 
              and landed their dream jobs using our platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "The speech analysis feature completely transformed my interview confidence. 
                  I went from stumbling over words to delivering clear, impactful responses."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">S</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Software Engineer at Google</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "The AI coach helped me prepare for behavioral questions I never thought of. 
                  I landed my dream job at a top consulting firm!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">M</span>
                  </div>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Management Consultant at McKinsey</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "The resume optimization tool identified key improvements that helped me 
                  get through ATS systems and land interviews at top tech companies."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-semibold">Alex Thompson</p>
                    <p className="text-sm text-muted-foreground">Product Manager at Microsoft</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of professionals who have already improved their interview performance 
            and landed their dream jobs. Start your journey today with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                <Rocket className="h-5 w-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="/train">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Target className="h-5 w-5" />
                Try Interview Training
              </Button>
            </Link>
          </div>
          <p className="text-sm opacity-75 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">AI Interview Assistant</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering professionals to master their interview skills with AI-driven analysis and personalized coaching.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/speech-analysis" className="hover:text-foreground">Speech Analysis</Link></li>
                <li><Link href="/resume-analysis" className="hover:text-foreground">Resume Analysis</Link></li>
                <li><Link href="/train" className="hover:text-foreground">Interview Training</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/chat-bot" className="hover:text-foreground">AI Coach</Link></li>
                <li><Link href="/progress" className="hover:text-foreground">Progress Tracking</Link></li>
                <li><Link href="/export" className="hover:text-foreground">Export Data</Link></li>
                <li><Link href="/settings" className="hover:text-foreground">Settings</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/profile" className="hover:text-foreground">Profile</Link></li>
                <li><Link href="/dashboard#contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2024 AI Interview Assistant. All rights reserved.</p>
            <p>Built with ❤️ for career success</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
