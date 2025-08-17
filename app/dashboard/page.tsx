"use client"

import { motion } from "framer-motion"
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export default function DashboardPage() {
  return (
    <motion.div 
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Interview Preparation
            </motion.div>
            <motion.h1 
              className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Master Your Interview
              <span className="text-primary"> Skills</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Transform your interview performance with AI-driven speech analysis, resume optimization, 
              and personalized coaching. Get real-time feedback and improve your confidence.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="/speech-analysis">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 minimal-shadow hover:minimal-shadow-hover transition-all duration-300 hover:scale-105">
                  <Play className="h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  <Target className="h-5 w-5" />
                  Learn More
                </Button>
              </Link>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.div 
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary/80 transition-colors">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </motion.div>
              <motion.div 
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary/80 transition-colors">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </motion.div>
              <motion.div 
                className="text-center group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary/80 transition-colors">50+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-20 bg-muted/30"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and features designed to help you excel in any interview scenario
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: "Speech Analysis",
                description: "Get real-time feedback on your speaking patterns, pace, and confidence levels.",
                features: ["Voice tone analysis", "Speaking rate optimization", "Confidence scoring"]
              },
              {
                icon: FileText,
                title: "Resume Optimization",
                description: "AI-powered resume analysis with industry-specific recommendations.",
                features: ["ATS optimization", "Keyword analysis", "Industry insights"]
              },
              {
                icon: Brain,
                title: "Smart Training",
                description: "Personalized learning paths based on your performance and goals.",
                features: ["Adaptive questions", "Progress tracking", "Skill assessment"]
              },
              {
                icon: MessageSquare,
                title: "AI Chat Assistant",
                description: "24/7 interview coaching and question practice with AI guidance.",
                features: ["Instant feedback", "Question bank", "Role-play scenarios"]
              },
              {
                icon: BarChart3,
                title: "Performance Analytics",
                description: "Track your progress with detailed insights and improvement areas.",
                features: ["Progress metrics", "Weakness identification", "Goal setting"]
              },
              {
                icon: Shield,
                title: "Interview Security",
                description: "Practice in a safe environment with privacy-focused features.",
                features: ["Data encryption", "Privacy controls", "Secure storage"]
              },
              {
                icon: FileText,
                title: "Transcript Generation",
                description: "Automatic transcription of all your interview practice sessions for review.",
                features: ["Real-time transcription", "Text editing & export", "Search & highlight"]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ 
                  y: -4,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <Card className="h-full border-0 minimal-card hover:minimal-shadow-hover transition-all duration-300">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <motion.li 
                          key={idx}
                          className="flex items-center text-sm text-muted-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + idx * 0.05 }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Customer Feedback Section */}
      <motion.section 
        className="py-20 bg-background"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their interview skills
            </p>
          </motion.div>

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
          <motion.div 
            className="mt-16 text-center"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground mb-6">Trusted by leading companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">Google</div>
              <div className="text-2xl font-bold text-muted-foreground">Microsoft</div>
              <div className="text-2xl font-bold text-muted-foreground">Amazon</div>
              <div className="text-2xl font-bold text-muted-foreground">Meta</div>
              <div className="text-2xl font-bold text-muted-foreground">Netflix</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Founders Section */}
      <motion.section 
        className="py-20 bg-muted/30"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Meet Our Founders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A team of AI researchers and career development experts passionate about democratizing 
              interview preparation
            </p>
          </motion.div>

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
          <motion.div 
            className="mt-16 text-center max-w-4xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Us Section */}
      <motion.section 
        id="contact" 
        className="py-20 bg-background"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? Want to learn more? We'd love to hear from you.
            </p>
          </motion.div>

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
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-primary/10 to-primary/5"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who have improved their interview performance with AI-powered coaching.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/speech-analysis">
                <Button size="lg" className="gap-2 text-lg px-10 py-6 minimal-shadow hover:minimal-shadow-hover transition-all duration-300">
                  <Rocket className="h-5 w-5" />
                  Get Started Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  )
}
