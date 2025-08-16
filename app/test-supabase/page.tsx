"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { dbClient } from '@/lib/supabase/database-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Database, User, Shield } from 'lucide-react'

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')
  const [user, setUser] = useState<any>(null)
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('testpassword123')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  useEffect(() => {
    testConnection()
    checkAuth()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const questions = await dbClient.getQuestions()
      
      if (questions.length >= 0) {
        setConnectionStatus('connected')
        setMessage('Successfully connected to Supabase!')
      } else {
        setConnectionStatus('error')
        setMessage('Connection failed: No data returned')
      }
    } catch (error) {
      console.error('Connection test exception:', error)
      setConnectionStatus('error')
      setMessage(`Connection exception: ${error}`)
    }
  }

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth check error:', error)
        setAuthStatus('unauthenticated')
      } else if (session?.user) {
        setUser(session.user)
        setAuthStatus('authenticated')
      } else {
        setAuthStatus('unauthenticated')
      }
    } catch (error) {
      console.error('Auth check exception:', error)
      setAuthStatus('unauthenticated')
    }
  }

  const testSignUp = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      })

      if (error) {
        setMessage(`Sign up failed: ${error.message}`)
      } else if (data.user && !data.session) {
        setMessage('Account created! Check your email for confirmation.')
      } else if (data.session) {
        setMessage('Account created and signed in successfully!')
        setUser(data.user)
        setAuthStatus('authenticated')
      }
    } catch (error) {
      setMessage(`Sign up exception: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignIn = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      if (error) {
        setMessage(`Sign in failed: ${error.message}`)
      } else if (data.user) {
        setMessage('Signed in successfully!')
        setUser(data.user)
        setAuthStatus('authenticated')
      }
    } catch (error) {
      setMessage(`Sign in exception: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignOut = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setMessage(`Sign out failed: ${error.message}`)
      } else {
        setMessage('Signed out successfully!')
        setUser(null)
        setAuthStatus('unauthenticated')
      }
    } catch (error) {
      setMessage(`Sign out exception: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseQuery = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const questions = await dbClient.getQuestions()
      
      if (questions.length > 0) {
        setMessage(`Database query successful! Found ${questions.length} questions.`)
        console.log('Questions data:', questions)
      } else {
        setMessage('Database query successful but no questions found.')
      }
    } catch (error) {
      setMessage(`Database query exception: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Integration Test</h1>
          <p className="text-gray-600">Test your Supabase connection and authentication</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {connectionStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {connectionStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <span className="font-medium">
                  {connectionStatus === 'checking' && 'Checking...'}
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'error' && 'Error'}
                </span>
              </div>
              <Button 
                onClick={testConnection} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                Test Connection
              </Button>
            </CardContent>
          </Card>

          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {authStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                {authStatus === 'authenticated' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {authStatus === 'unauthenticated' && <XCircle className="h-4 w-4 text-red-500" />}
                <span className="font-medium">
                  {authStatus === 'checking' && 'Checking...'}
                  {authStatus === 'authenticated' && 'Authenticated'}
                  {authStatus === 'unauthenticated' && 'Not Authenticated'}
                </span>
              </div>
              {user && (
                <div className="text-sm text-gray-600 mb-2">
                  User: {user.email}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Test Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testEmail">Test Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testPassword">Test Password</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="testpassword123"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testSignUp} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Sign Up'}
              </Button>
              
              <Button 
                onClick={testSignIn} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Sign In'}
              </Button>
              
              <Button 
                onClick={testSignOut} 
                disabled={isLoading || authStatus !== 'authenticated'}
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Sign Out'}
              </Button>
              
              <Button 
                onClick={testDatabaseQuery} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Database Query'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {message && (
          <Alert className={message.includes('failed') || message.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.includes('failed') || message.includes('Error') ? 'text-red-800' : 'text-green-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Variables Check */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Environment Variables Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </div>
              <div>
                <strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </div>
              <div>
                <strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
