import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    console.log('Middleware: Supabase not configured, skipping auth')
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    console.log('Middleware: Auth callback detected, exchanging code for session')
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to dashboard after successful auth
    console.log('Middleware: Redirecting to dashboard after auth callback')
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Middleware: User auth check:', { user: !!user, path: request.nextUrl.pathname })

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login")
  const isPublicRoute = request.nextUrl.pathname === "/"
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")

  if (!isAuthRoute && !isPublicRoute && !isApiRoute && !user) {
    console.log('Middleware: Redirecting unauthenticated user to login')
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (isAuthRoute && user) {
    console.log('Middleware: Redirecting authenticated user from login to dashboard')
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}
