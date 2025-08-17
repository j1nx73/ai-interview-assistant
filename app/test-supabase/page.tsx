"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestSupabasePage() {
  const { user, session, loading, isAuthenticated, signIn, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [testResult, setTestResult] = useState("")
  const [isTesting, setIsTesting] = useState(false)

  const testSupabaseConnection = async () => {
    setIsTesting(true)
    setTestResult("Testing Supabase connection...")
    
    try {
      // Test basic connection
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`❌ Error: ${error.message}`)
        return
      }
      
      setTestResult(`✅ Connection successful! Session: ${data.session ? 'Yes' : 'No'}`)
    } catch (error) {
      setTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const testSignIn = async () => {
    if (!email || !password) {
      setTestResult("❌ Please enter email and password")
      return
    }
    
    setIsTesting(true)
    setTestResult("Testing sign in...")
    
    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        setTestResult(`❌ Sign in failed: ${result.error.message}`)
      } else {
        setTestResult(`✅ Sign in successful! User: ${result.data?.user?.email}`)
      }
    } catch (error) {
      setTestResult(`❌ Sign in exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Variables Check */}
          <div className="space-y-2">
            <h3 className="font-semibold">Environment Variables</h3>
            <div className="text-sm space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}</div>
            </div>
          </div>

          {/* Auth State */}
          <div className="space-y-2">
            <h3 className="font-semibold">Authentication State</h3>
            <div className="text-sm space-y-1">
              <div>Loading: {loading ? '🔄 Yes' : '✅ No'}</div>
              <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
              <div>User: {user ? `✅ ${user.email}` : '❌ None'}</div>
              <div>Session: {session ? '✅ Active' : '❌ None'}</div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test Connection</h3>
            <Button 
              onClick={testSupabaseConnection} 
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? 'Testing...' : 'Test Supabase Connection'}
            </Button>
          </div>

          {/* Test Sign In */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test Sign In</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            <Button 
              onClick={testSignIn} 
              disabled={isTesting || !email || !password}
            >
              {isTesting ? 'Signing In...' : 'Test Sign In'}
            </Button>
          </div>

          {/* Sign Out */}
          {isAuthenticated && (
            <div className="space-y-2">
              <h3 className="font-semibold">Sign Out</h3>
              <Button onClick={signOut} variant="destructive">
                Sign Out
              </Button>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results</h3>
              <div className="p-3 bg-muted rounded-md text-sm">
                {testResult}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
