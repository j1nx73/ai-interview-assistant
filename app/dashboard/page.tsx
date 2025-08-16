import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Mic,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  Calendar,
  Award,
  BarChart3,
  Play,
  CheckCircle2,
  AlertCircle,
  Star,
  Users,
  Target,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Quote,
  Sparkles,
  Brain,
  Shield,
  Rocket,
  Heart,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Interview Preparation
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Master Your Interview
              <span className="text-primary"> Skills</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your interview performance with AI-driven speech analysis, resume optimization, 
              and personalized coaching. Get real-time feedback and improve your confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/speech-analysis">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  <Play className="h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                  <Target className="h-5 w-5" />
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with proven interview strategies
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Speech Analysis */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Speech Analysis</CardTitle>
                <CardDescription>
                  AI-powered speech recognition and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Real-time speech recognition</li>
                  <li>• Speaking rate optimization</li>
                  <li>• Confidence scoring</li>
                  <li>• Pause pattern analysis</li>
                </ul>
                <Link href="/speech-analysis">
                  <Button className="w-full gap-2">
                    Try Speech Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Resume Analysis */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Resume Optimization</CardTitle>
                <CardDescription>
                  AI-driven resume analysis and improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Keyword optimization</li>
                  <li>• ATS compatibility check</li>
                  <li>• Content enhancement</li>
                  <li>• Industry-specific advice</li>
                </ul>
                <Link href="/resume-analysis">
                  <Button className="w-full gap-2">
                    Optimize Resume
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Interview Coach */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">AI Interview Coach</CardTitle>
                <CardDescription>
                  Personalized interview preparation guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Mock interview sessions</li>
                  <li>• Behavioral question prep</li>
                  <li>• Industry insights</li>
                  <li>• Real-time feedback</li>
                </ul>
                <Link href="/chat-bot">
                  <Button className="w-full gap-2">
                    Chat with AI Coach
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Interview Training */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Interview Training</CardTitle>
                <CardDescription>
                  Practice questions with AI-powered feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Preset interview questions</li>
                  <li>• Speech analysis & scoring</li>
                  <li>• Detailed feedback & tips</li>
                  <li>• Progress tracking</li>
                </ul>
                <Link href="/train">
                  <Button className="w-full gap-2">
                    Start Training
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Progress Analytics</CardTitle>
                <CardDescription>
                  Track your improvement over time
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• Performance metrics</li>
                  <li>• Skill development tracking</li>
                  <li>• Goal setting</li>
                  <li>• Detailed reports</li>
                </ul>
                <Link href="/progress">
                  <Button className="w-full gap-2">
                    View Progress
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level security for your data
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• End-to-end encryption</li>
                  <li>• GDPR compliance</li>
                  <li>• SOC 2 certified</li>
                  <li>• Regular security audits</li>
                </ul>
                <Button variant="outline" className="w-full gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Integration */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-background">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl">Seamless Integration</CardTitle>
                <CardDescription>
                  Works with your existing tools
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>• API access</li>
                  <li>• Webhook support</li>
                  <li>• Custom integrations</li>
                  <li>• White-label solutions</li>
                </ul>
                <Button variant="outline" className="w-full gap-2">
                  View API Docs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their interview skills
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <Card className="relative border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
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

            {/* Testimonial 2 */}
            <Card className="relative border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
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

            {/* Testimonial 3 */}
            <Card className="relative border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
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

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">Trusted by leading companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">Google</div>
              <div className="text-2xl font-bold text-muted-foreground">Microsoft</div>
              <div className="text-2xl font-bold text-muted-foreground">Amazon</div>
              <div className="text-2xl font-bold text-muted-foreground">Meta</div>
              <div className="text-2xl font-bold text-muted-foreground">Netflix</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Founders Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Meet Our Founders
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A team of AI researchers and career development experts passionate about democratizing 
              interview preparation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Founder 1 */}
            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Dr. Emily Watson</h3>
                <p className="text-primary font-medium mb-3">CEO & Co-Founder</p>
                <p className="text-muted-foreground mb-4">
                  Former AI Research Lead at OpenAI with 15+ years in natural language processing. 
                  PhD from Stanford University.
                </p>
                <div className="flex justify-center gap-3">
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Founder 2 */}
            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Rocket className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">David Kim</h3>
                <p className="text-primary font-medium mb-3">CTO & Co-Founder</p>
                <p className="text-muted-foreground mb-4">
                  Ex-Engineering Manager at Google with expertise in scalable AI systems. 
                  MS in Computer Science from MIT.
                </p>
                <div className="flex justify-center gap-3">
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Github className="h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Founder 3 */}
            <Card className="text-center border-0 bg-background shadow-lg">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Dr. Sarah Johnson</h3>
                <p className="text-primary font-medium mb-3">Head of Product</p>
                <p className="text-muted-foreground mb-4">
                  Former Career Development Director at Harvard with 20+ years helping 
                  professionals advance their careers.
                </p>
                <div className="flex justify-center gap-3">
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Story */}
          <div className="mt-16 text-center max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl font-bold mb-6">Our Story</h3>
            <p className="text-muted-foreground leading-relaxed">
              Founded in 2023, we started with a simple mission: to make professional interview preparation 
              accessible to everyone. After witnessing countless talented individuals struggle with interviews 
              due to lack of proper preparation tools, we combined cutting-edge AI technology with proven 
              career development methodologies to create a comprehensive platform that truly makes a difference.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Today, we're proud to have helped over 10,000 professionals land their dream jobs, 
              with a 95% success rate and partnerships with leading companies worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? Want to learn more? We'd love to hear from you.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-serif">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Your Company" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us how we can help you..."
                    rows={4}
                  />
                </div>
                <Button className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">hello@aiinterviewassistant.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">
                        123 Innovation Drive<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold mb-6">Business Hours</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold mb-6">Follow Us</h3>
                <div className="flex gap-4">
                  <Link href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Linkedin className="h-5 w-5 text-primary" />
                  </Link>
                  <Link href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Twitter className="h-5 w-5 text-primary" />
                  </Link>
                  <Link href="#" className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Github className="h-5 w-5 text-primary" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold mb-4">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who have already improved their interview performance 
            and landed their dream jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/speech-analysis">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                <Play className="h-5 w-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <MessageSquare className="h-5 w-5" />
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
