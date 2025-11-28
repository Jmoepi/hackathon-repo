import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Define route configurations
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
  "/onboarding",
]

const AUTH_ROUTES = ["/login", "/signup", "/verify-otp", "/forgot-password"]

const PROTECTED_ROUTES = [
  "/dashboard",
  "/inventory",
  "/payments",
  "/customers",
  "/airtime-data",
  "/settings",
  "/profile",
]

// Security headers for all responses
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response with security headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Skip middleware for static files and API routes (except auth-related)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return response
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://placeholder.supabase.co") {
    // Supabase not configured - allow access to all routes in development
    console.warn("Supabase not configured. Authentication disabled.")
    return response
  }

  try {
    // Create Supabase client with cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Get user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Handle auth errors
    if (error) {
      console.error("Auth error in middleware:", error.message)
      // Clear potentially corrupted session
      if (error.message.includes("token")) {
        response.cookies.delete("sb-access-token")
        response.cookies.delete("sb-refresh-token")
      }
    }

    const isAuthenticated = !!user && !error
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
    const isAuthRoute = AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
    const isProtectedRoute = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuthRoute) {
      const redirectUrl = new URL("/dashboard", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect unauthenticated users from protected routes
    if (!isAuthenticated && isProtectedRoute) {
      const redirectUrl = new URL("/login", request.url)
      // Store the original URL to redirect back after login
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Add security headers back to the response
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, allow access but log the issue
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
