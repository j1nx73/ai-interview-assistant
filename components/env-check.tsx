"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

interface EnvCheckProps {
  showDetails?: boolean
}

export default function EnvCheck({ showDetails = false }: EnvCheckProps) {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    isConfigured: boolean
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    isConfigured: false
  })

  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkEnv = () => {
      const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const isConfigured = supabaseUrl && supabaseKey

      setEnvStatus({
        supabaseUrl,
        supabaseKey,
        isConfigured
      })
      setIsChecking(false)
    }

    // Small delay to ensure environment variables are loaded
    setTimeout(checkEnv, 100)
  }, [])

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking configuration...
      </div>
    )
  }

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 text-sm">
        {envStatus.isConfigured ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600">Configured</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-600">Not Configured</span>
          </>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Environment Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Supabase URL</span>
            {envStatus.supabaseUrl ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Supabase Anon Key</span>
            {envStatus.supabaseKey ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Status</span>
            {envStatus.isConfigured ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Configuration Required</span>
              </div>
            )}
          </div>
        </div>

        {!envStatus.isConfigured && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Configuration Required</p>
                <p className="text-xs">
                  Create a <code className="bg-amber-100 px-1 rounded">.env.local</code> file with your Supabase credentials.
                  See <code className="bg-amber-100 px-1 rounded">SETUP_GUIDE.md</code> for instructions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
