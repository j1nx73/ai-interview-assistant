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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Shield, Zap, Target, Loader2, AlertCircle, Github, Twitter, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { dbClient } from "@/lib/supabase/database-client"

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
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [databaseStatus, setDatabaseStatus] = useState<{ status: string; tables: string[]; errors: string[] } | null>(null)
  
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

  // Check database status
  useEffect(() => {
    const checkDatabase = async () => {
      if (isSupabaseConfigured) {
        try {
          const status = await dbClient.checkDatabaseStatus()
          setDatabaseStatus(status)
        } catch (error) {
          console.error('Error checking database status:', error)
        }
      }
    }
    
    checkDatabase()
  }, [isSupabaseConfigured])

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(signUpForm.password))
  }, [signUpForm.password])

  // Auto-hide success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        setSuccessMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  // Validate form fields
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors[field] = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
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
      
      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error.message,
          variant: "destructive",
        })
      } else {
        setSuccessMessage("Login successful! Redirecting to dashboard...")
        setShowSuccess(true)
        
        // Clear form
        setLoginForm({
          email: "",
          password: "",
          rememberMe: false
        })
        setErrors({})
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
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
    
    if (!isValid) return

    setIsSignUpLoading(true)
    
    try {
      const result = await signUp(
        signUpForm.email, 
        signUpForm.password,
        {
          first_name: signUpForm.firstName,
          last_name: signUpForm.lastName
        }
      )
      
      if (result.error) {
        toast({
          title: "Sign Up Failed",
          description: result.error.message,
          variant: "destructive",
        })
      } else {
        setSuccessMessage("Account created successfully! Please check your email to verify your account.")
        setShowSuccess(true)
        
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
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
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
          {/* Supabase Configuration Status */}
          {!isSupabaseConfigured && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-4"
            >
              <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuration Required:</strong> Supabase environment variables are not set.
                  <span className="block mt-1 text-sm">
                    Please create a <code className="bg-orange-100 px-1 rounded">.env.local</code> file with your Supabase credentials.
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Database Status */}
          {databaseStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-4"
            >
              <Alert className={`
                ${databaseStatus.status === 'healthy' ? 'border-green-200 bg-green-50 text-green-800' : ''}
                ${databaseStatus.status === 'partial' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' : ''}
                ${databaseStatus.status === 'unconfigured' ? 'border-red-200 bg-red-50 text-red-800' : ''}
                ${databaseStatus.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : ''}
              `}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Database Status:</strong> {databaseStatus.status}
                  {databaseStatus.tables.length > 0 && (
                    <span className="block mt-1">
                      ✅ Tables: {databaseStatus.tables.join(', ')}
                    </span>
                  )}
                  {databaseStatus.errors.length > 0 && (
                    <span className="block mt-1">
                      ❌ Issues: {databaseStatus.errors.join(', ')}
                    </span>
                  )}
                  {databaseStatus.status === 'unconfigured' && (
                    <span className="block mt-2 text-sm">
                      Please run the database setup script in your Supabase SQL Editor.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-4"
              >
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) => {
                            setLoginForm(prev => ({ ...prev, email: e.target.value }))
                            validateField('email', e.target.value)
                          }}
                          className="pl-10 input-enhanced"
                          required
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => {
                            setLoginForm(prev => ({ ...prev, password: e.target.value }))
                            validateField('password', e.target.value)
                          }}
                          className="pl-10 pr-10 input-enhanced"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={loginForm.rememberMe}
                          onCheckedChange={(checked) => 
                            setLoginForm(prev => ({ ...prev, rememberMe: checked as boolean }))
                          }
                        />
                        <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                      </div>
                      <Link href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full btn-enhanced" 
                        disabled={isLoading || !isSupabaseConfigured}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-firstname"
                            type="text"
                            placeholder="First name"
                            value={signUpForm.firstName}
                            onChange={(e) => {
                              setSignUpForm(prev => ({ ...prev, firstName: e.target.value }))
                              validateField('firstName', e.target.value)
                            }}
                            className="pl-10 input-enhanced"
                            required
                          />
                        </div>
                        {errors.firstName && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-destructive"
                          >
                            {errors.firstName}
                          </motion.p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastname">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-lastname"
                            type="text"
                            placeholder="Last name"
                            value={signUpForm.lastName}
                            onChange={(e) => {
                              setSignUpForm(prev => ({ ...prev, lastName: e.target.value }))
                              validateField('lastName', e.target.value)
                            }}
                            className="pl-10 input-enhanced"
                            required
                          />
                        </div>
                        {errors.lastName && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-destructive"
                          >
                            {errors.lastName}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signUpForm.email}
                          onChange={(e) => {
                            setSignUpForm(prev => ({ ...prev, email: e.target.value }))
                            validateField('email', e.target.value)
                          }}
                          className="pl-10 input-enhanced"
                          required
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signUpForm.password}
                          onChange={(e) => {
                            setSignUpForm(prev => ({ ...prev, password: e.target.value }))
                            validateField('password', e.target.value)
                          }}
                          className="pl-10 pr-10 input-enhanced"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signUpForm.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Password strength:</span>
                            <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                              {passwordStrength.level}
                            </span>
                          </div>
                          <Progress value={passwordStrength.score * 20} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {passwordStrength.feedback.join(', ')}
                          </div>
                        </motion.div>
                      )}
                      
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signUpForm.confirmPassword}
                          onChange={(e) => {
                            setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                            validateField('confirmPassword', e.target.value)
                          }}
                          className="pl-10 pr-10 input-enhanced"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-destructive"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agree-terms"
                        checked={signUpForm.agreeToTerms}
                        onCheckedChange={(checked) => 
                          setSignUpForm(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                        }
                      />
                      <Label htmlFor="agree-terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="#" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    
                    {errors.terms && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.terms}
                      </motion.p>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full btn-enhanced" 
                        disabled={isSignUpLoading || !isSupabaseConfigured}
                      >
                        {isSignUpLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
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
