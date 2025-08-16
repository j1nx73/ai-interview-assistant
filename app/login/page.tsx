"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, Shield, Zap, Target, Loader2, AlertCircle, Github, Twitter } from "lucide-react"
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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  
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
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

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
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors[field] = 'Please enter a valid email'
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
      case 'firstName':
      case 'lastName':
        if (!value) {
          newErrors[field] = `${field === 'firstName' ? 'First name' : 'Last name'} is required`
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
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login form changes
  const handleLoginChange = (field: string, value: string | boolean) => {
    setLoginForm(prev => ({ ...prev, [field]: value }))
    if (typeof value === 'string' && errors[field]) {
      validateField(field, value)
    }
  }

  // Handle signup form changes
  const handleSignUpChange = (field: string, value: string | boolean) => {
    setSignUpForm(prev => ({ ...prev, [field]: value }))
    if (typeof value === 'string' && errors[field]) {
      validateField(field, value)
    }
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const isEmailValid = validateField('email', loginForm.email)
    const isPasswordValid = validateField('password', loginForm.password)
    
    if (!isEmailValid || !isPasswordValid) return

    if (demoMode) {
      // Demo mode - simulate successful login
      toast({
        title: "Demo Mode",
        description: "This is a demo. In production, you would be logged in.",
      })
      setTimeout(() => router.push("/dashboard"), 1500)
      return
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Authentication is not configured. Please contact support.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await signIn(loginForm.email, loginForm.password)

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Success - redirect will happen automatically via useEffect
      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const validations = [
      validateField('firstName', signUpForm.firstName),
      validateField('lastName', signUpForm.lastName),
      validateField('email', signUpForm.email),
      validateField('password', signUpForm.password),
      validateField('confirmPassword', signUpForm.confirmPassword)
    ]
    
    if (validations.some(v => !v)) return

    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (!signUpForm.agreeToTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    if (demoMode) {
      // Demo mode - simulate successful signup
      toast({
        title: "Demo Mode",
        description: "This is a demo. In production, your account would be created.",
      })
      setTimeout(() => router.push("/dashboard"), 1500)
      return
    }

    if (!isSupabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Authentication is not configured. Please contact support.",
        variant: "destructive",
      })
      return
    }

    setIsSignUpLoading(true)
    
    try {
      const { data, error } = await signUp(signUpForm.email, signUpForm.password, {
        first_name: signUpForm.firstName,
        last_name: signUpForm.lastName
      })

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation email to verify your account.",
        })
      } else if (data.session) {
        toast({
          title: "Account created successfully",
          description: "Welcome to AI Interview Assistant!",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSignUpLoading(false)
    }
  }

  // Demo login
  const handleDemoLogin = () => {
    setDemoMode(true)
    setLoginForm({
      email: "demo@example.com",
      password: "demo123456",
      rememberMe: false
    })
    toast({
      title: "Demo Mode Enabled",
      description: "Use demo@example.com / demo123456 to test the login.",
    })
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-gray-900">AI Interview Assistant</h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master your interviews with AI-powered preparation, real-time feedback, and personalized learning paths.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Speech Analysis</h3>
                <p className="text-gray-600">Get real-time feedback on your speaking skills and confidence</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Resume Optimization</h3>
                <p className="text-gray-600">AI-powered analysis to match your resume with job requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personalized Learning</h3>
                <p className="text-gray-600">Custom learning paths based on your skill gaps and goals</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Join 10,000+ job seekers</span>
            </div>
            <p className="text-gray-600">
              "This platform helped me land my dream job at Google. The AI feedback was incredibly accurate and
              actionable."
            </p>
            <p className="text-sm text-gray-500 mt-2">- Sarah Chen, Software Engineer</p>
          </div>

          {/* Demo Mode Notice */}
          {!isSupabaseConfigured && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Demo Mode:</strong> Authentication is not configured. Use demo credentials to test the interface.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-2">
              <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="font-serif text-xl font-bold">InterviewAI</span>
              </div>
              <CardTitle className="font-serif text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to continue your interview preparation journey</CardDescription>
              
              {/* Demo Mode Button */}
              {!isSupabaseConfigured && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDemoLogin}
                  className="mt-2"
                >
                  Try Demo Mode
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email" 
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          value={loginForm.email}
                          onChange={(e) => handleLoginChange("email", e.target.value)}
                          onBlur={(e) => validateField("email", e.target.value)}
                          required 
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          value={loginForm.password}
                          onChange={(e) => handleLoginChange("password", e.target.value)}
                          onBlur={(e) => validateField("password", e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={loginForm.rememberMe}
                          onCheckedChange={(checked) => handleLoginChange("rememberMe", checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2 bg-transparent hover:bg-gray-50">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent hover:bg-gray-50">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="firstName" 
                            placeholder="John" 
                            className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                            value={signUpForm.firstName}
                            onChange={(e) => handleSignUpChange("firstName", e.target.value)}
                            onBlur={(e) => validateField("firstName", e.target.value)}
                            required 
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          className={errors.lastName ? 'border-red-500' : ''}
                          value={signUpForm.lastName}
                          onChange={(e) => handleSignUpChange("lastName", e.target.value)}
                          onBlur={(e) => validateField("lastName", e.target.value)}
                          required 
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="Enter your email"
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          value={signUpForm.email}
                          onChange={(e) => handleSignUpChange("email", e.target.value)}
                          onBlur={(e) => validateField("email", e.target.value)}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          value={signUpForm.password}
                          onChange={(e) => handleSignUpChange("password", e.target.value)}
                          onBlur={(e) => validateField("password", e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signUpForm.password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Password strength:</span>
                            <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                              {passwordStrength.level}
                            </span>
                          </div>
                          <Progress value={passwordStrength.score * 20} className="h-2" />
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {passwordStrength.feedback.map((item, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${passwordStrength.score >= index + 1 ? passwordStrength.color : 'bg-gray-300'}`} />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {errors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          value={signUpForm.confirmPassword}
                          onChange={(e) => handleSignUpChange("confirmPassword", e.target.value)}
                          onBlur={(e) => validateField("confirmPassword", e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={signUpForm.agreeToTerms}
                        onCheckedChange={(checked) => handleSignUpChange("agreeToTerms", checked as boolean)}
                        required 
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-emerald-600 hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-emerald-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    <Button type="submit" className="w-full gap-2" size="lg" disabled={isSignUpLoading}>
                      {isSignUpLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2 bg-transparent hover:bg-gray-50">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" className="gap-2 bg-transparent hover:bg-gray-50">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-600 mt-6">
            Protected by industry-standard encryption and security measures
          </p>
        </div>
      </div>
    </div>
  )
}
