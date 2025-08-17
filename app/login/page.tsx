"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Brain, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Shield, Zap, Target, Loader2, Github, Twitter, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

// Password strength checker
const getPasswordStrength = (password: string) => {
  let score = 0
  let feedback = []

  if (password.length >= 8) score += 1
  else feedback.push("At least 8 characters")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("Lowercase letter")

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("Uppercase letter")

  if (/[0-9]/.test(password)) score += 1
  else feedback.push("Number")

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push("Special character")

  if (score <= 2) return { score, level: "Weak", color: "bg-red-500", feedback }
  if (score <= 3) return { score, level: "Fair", color: "bg-yellow-500", feedback }
  if (score <= 4) return { score, level: "Good", color: "bg-blue-500", feedback }
  return { score, level: "Strong", color: "bg-green-500", feedback }
}

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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  
  // Form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  })
  
  const [signUpForm, setSignUpForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  })

  // Form validation
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(""))

  // Check if Supabase is configured
  const isSupabaseConfigured = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" && 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0

  // Check if user is already authenticated
  useEffect(() => {
    console.log('Login page useEffect - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading, 'redirecting:', redirecting)
    
    if (isAuthenticated && !authLoading && !redirecting) {
      setRedirecting(true)
      console.log('User authenticated, redirecting to dashboard...')
      router.push("/dashboard")
    }
  }, [isAuthenticated, authLoading, router, redirecting])

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(signUpForm.password))
  }, [signUpForm.password])

  // Validate form fields
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors[field] = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field] = 'Please enter a valid email address'
        } else {
          delete newErrors[field]
        }
        break
      case 'password':
        if (!value) {
          newErrors[field] = 'Password is required'
        } else if (value.length < 8) {
          newErrors[field] = 'Password must be at least 8 characters'
        } else {
          delete newErrors[field]
        }
        break
      case 'confirmPassword':
        if (!value) {
          newErrors[field] = 'Please confirm your password'
        } else if (value !== signUpForm.password) {
          newErrors[field] = 'Passwords do not match'
        } else {
          delete newErrors[field]
        }
        break
      case 'firstName':
        if (!value) {
          newErrors[field] = 'First name is required'
        } else {
          delete newErrors[field]
        }
        break
      case 'lastName':
        if (!value) {
          newErrors[field] = 'Last name is required'
        } else {
          delete newErrors[field]
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateField('email', loginForm.email) || !validateField('password', loginForm.password)) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await signIn(loginForm.email, loginForm.password)
      
      console.log('Login result:', result)
      
      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error.message,
          variant: "destructive",
        })
      } else {
        console.log('Login successful, result data:', result.data)
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        })
        
        // Clear form
        setLoginForm({
          email: "",
          password: "",
          rememberMe: false
        })
        setErrors({})
        
        // Let the useEffect handle the redirect instead of manual redirect
        console.log('Login successful, waiting for auth state update...')
        
        // Fallback redirect in case the auth state doesn't update immediately
        setTimeout(() => {
          if (!redirecting) {
            console.log('Fallback redirect to dashboard...')
            router.push("/dashboard")
          }
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Starting signup process...')
    console.log('Form data:', signUpForm)
    
    // Validate all fields
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
    let isValid = true
    
    fields.forEach(field => {
      if (!validateField(field, signUpForm[field as keyof typeof signUpForm] as string)) {
        isValid = false
      }
    })
    
    if (!signUpForm.agreeToTerms) {
      setErrors(prev => ({ ...prev, terms: 'You must agree to the terms and conditions' }))
      isValid = false
    }
    
    if (!isValid) {
      console.log('Form validation failed:', errors)
      return
    }

    setIsSignUpLoading(true)
    
    try {
      console.log('Calling signUp function...')
      const result = await signUp(
        signUpForm.email, 
        signUpForm.password,
        {
          first_name: signUpForm.firstName,
          last_name: signUpForm.lastName
        }
      )
      
      console.log('SignUp result:', result)
      
      if (result.error) {
        console.error('SignUp error:', result.error)
        toast({
          title: "Sign Up Failed",
          description: result.error.message || "An error occurred during signup. Please try again.",
          variant: "destructive",
        })
      } else {
        console.log('SignUp successful!')
        toast({
          title: "Account Created",
          description: "Account created successfully! Please check your email to verify your account.",
        })
        
        // Clear form after successful signup
        setSignUpForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false
        })
        setErrors({})
        
        // Wait a bit then redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 5000)
      }
    } catch (error) {
      console.error('SignUp exception:', error)
      toast({
        title: "Sign Up Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSignUpLoading(false)
    }
  }

  const handleDemoMode = () => {
    setDemoMode(true)
    // Simulate demo login
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            className="h-16 w-16 border-4 border-muted-foreground/20 border-t-primary rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your experience...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            AI Interview Assistant
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Sign in to continue your interview preparation journey
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={cardVariants}
          className="w-full"
        >
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/30 rounded-lg border border-muted-foreground/20">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200 font-medium"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all duration-200 font-medium"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="login-email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center">
                          <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        </div>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={loginForm.email}
                          onChange={(e) => {
                            setLoginForm(prev => ({ ...prev, email: e.target.value }))
                            validateField('email', e.target.value)
                          }}
                          className="pl-12 pr-4 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                          required
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="login-password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center">
                          <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        </div>
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => {
                            setLoginForm(prev => ({ ...prev, password: e.target.value }))
                            validateField('password', e.target.value)
                          }}
                          className="pl-12 pr-12 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                          required
                        />
                        <div className="absolute right-4 top-0 bottom-0 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                          {errors.password}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="remember-me"
                          checked={loginForm.rememberMe}
                          onCheckedChange={(checked) => 
                            setLoginForm(prev => ({ ...prev, rememberMe: checked as boolean }))
                          }
                          className="h-4 w-4 text-primary border-2 border-muted-foreground/30 focus:ring-2 focus:ring-primary/20 rounded"
                        />
                        <Label htmlFor="remember-me" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Remember me</Label>
                      </div>
                      <Link href="#" className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-medium">
                        Forgot password?
                      </Link>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-4"
                    >
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={isLoading || !isSupabaseConfigured}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-6">
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="signup-firstname" className="text-sm font-medium text-foreground/80">First Name</Label>
                        <div className="relative group">
                          <div className="absolute left-4 top-0 bottom-0 flex items-center">
                            <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                          </div>
                          <Input
                            id="signup-firstname"
                            type="text"
                            placeholder="Enter your first name"
                            value={signUpForm.firstName}
                            onChange={(e) => {
                              setSignUpForm(prev => ({ ...prev, firstName: e.target.value }))
                              validateField('firstName', e.target.value)
                            }}
                            className="pl-12 pr-4 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                            required
                          />
                        </div>
                        {errors.firstName && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-destructive flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                            {errors.firstName}
                          </motion.p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="signup-lastname" className="text-sm font-medium text-foreground/80">Last Name</Label>
                        <div className="relative group">
                          <div className="absolute left-4 top-0 bottom-0 flex items-center">
                            <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                          </div>
                          <Input
                            id="signup-lastname"
                            type="text"
                            placeholder="Enter your last name"
                            value={signUpForm.lastName}
                            onChange={(e) => {
                              setSignUpForm(prev => ({ ...prev, lastName: e.target.value }))
                              validateField('lastName', e.target.value)
                            }}
                            className="pl-12 pr-4 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                            required
                          />
                        </div>
                        {errors.lastName && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-destructive flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                            {errors.lastName}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-foreground/80">Email Address</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center">
                          <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        </div>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={signUpForm.email}
                          onChange={(e) => {
                            setSignUpForm(prev => ({ ...prev, email: e.target.value }))
                            validateField('email', e.target.value)
                          }}
                          className="pl-12 pr-4 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                          required
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-foreground/80">Password</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center">
                          <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        </div>
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signUpForm.password}
                          onChange={(e) => {
                            setSignUpForm(prev => ({ ...prev, password: e.target.value }))
                            validateField('password', e.target.value)
                          }}
                          className="pl-12 pr-12 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                          required
                        />
                        <div className="absolute right-4 top-0 bottom-0 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signUpForm.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3 p-4 bg-muted/20 rounded-lg border border-muted-foreground/10"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Password strength:</span>
                            <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
                              passwordStrength.level === 'Weak' ? 'bg-red-100 text-red-700' :
                              passwordStrength.level === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                              passwordStrength.level === 'Good' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {passwordStrength.level}
                            </span>
                          </div>
                          <Progress value={passwordStrength.score * 20} className="h-2 bg-muted-foreground/20" />
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                            {passwordStrength.feedback.map((item, index) => (
                              <span key={index} className="px-2 py-1 bg-background/50 rounded-md border border-muted-foreground/20">
                                {item}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                          {errors.password}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-foreground/80">Confirm Password</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center">
                          <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                        </div>
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signUpForm.confirmPassword}
                          onChange={(e) => {
                            setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                            validateField('confirmPassword', e.target.value)
                          }}
                          className="pl-12 pr-12 h-12 text-base border-2 border-muted-foreground/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/50 hover:bg-background/80 rounded-xl"
                          required
                        />
                        <div className="absolute right-4 top-0 bottom-0 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-muted-foreground hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox
                        id="agree-terms"
                        checked={signUpForm.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setSignUpForm(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                        }
                        className="h-4 w-4 text-primary border-2 border-muted-foreground/30 focus:ring-2 focus:ring-primary/20 rounded mt-1"
                      />
                      <Label htmlFor="agree-terms" className="text-sm text-muted-foreground leading-relaxed">
                        I agree to the{" "}
                        <Link href="#" className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    
                    {errors.terms && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-destructive flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>
                        {errors.terms}
                      </motion.p>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-4"
                    >
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={isSignUpLoading || !isSupabaseConfigured}
                      >
                        {isSignUpLoading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          className="text-center mt-6"
          variants={itemVariants}
        >
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>

        {/* Floating Demo Mode Button */}
        {!isSupabaseConfigured && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button 
                onClick={handleDemoMode}
                className="rounded-full h-14 w-14 p-0 bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={demoMode}
              >
                {demoMode ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Zap className="h-6 w-6 text-white" />
                )}
              </Button>
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
              >
                Demo
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
