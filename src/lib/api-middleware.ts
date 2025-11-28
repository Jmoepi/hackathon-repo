import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  checkRateLimit,
  getClientIp,
  validateOrigin,
  errorResponse,
  apiSecurityHeaders,
} from "@/lib/security"

type ApiHandler = (
  request: NextRequest,
  context: { params: Record<string, string>; userId: string }
) => Promise<Response>

interface ApiMiddlewareOptions {
  requireAuth?: boolean
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  validateCsrf?: boolean
}

const defaultOptions: ApiMiddlewareOptions = {
  requireAuth: true,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  validateCsrf: true,
}

/**
 * Secure API middleware wrapper
 * Provides authentication, rate limiting, CSRF protection, and security headers
 */
export function withApiMiddleware(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  const config = { ...defaultOptions, ...options }

  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<Response> => {
    try {
      // Get client identifier for rate limiting
      const clientIp = getClientIp(request)
      const rateLimitKey = `api:${clientIp}:${request.nextUrl.pathname}`

      // Check rate limit
      if (config.rateLimit) {
        const { allowed, remaining, resetTime } = checkRateLimit(
          rateLimitKey,
          config.rateLimit.maxRequests,
          config.rateLimit.windowMs
        )

        if (!allowed) {
          return errorResponse("Too many requests. Please try again later.", 429, "RATE_LIMIT_EXCEEDED")
        }
      }

      // Validate CSRF for mutating requests
      if (config.validateCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
        const isValidOrigin = await validateOrigin(request)
        if (!isValidOrigin) {
          console.warn(`CSRF validation failed for ${request.nextUrl.pathname} from ${clientIp}`)
          return errorResponse("Invalid request origin", 403, "CSRF_VALIDATION_FAILED")
        }
      }

      // Check authentication if required
      let userId = ""
      if (config.requireAuth) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          return errorResponse("Authentication required", 401, "UNAUTHORIZED")
        }

        userId = user.id
      }

      // Call the actual handler
      const response = await handler(request, { params: context.params, userId })

      // Add security headers to response
      const headers = new Headers(response.headers)
      Object.entries(apiSecurityHeaders).forEach(([key, value]) => {
        if (!headers.has(key)) {
          headers.set(key, value)
        }
      })

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      console.error("API middleware error:", error)
      return errorResponse("Internal server error", 500, "INTERNAL_ERROR")
    }
  }
}

/**
 * Helper to create protected API routes
 */
export function createProtectedRoute(handler: ApiHandler, options?: ApiMiddlewareOptions) {
  return withApiMiddleware(handler, { ...options, requireAuth: true })
}

/**
 * Helper to create public API routes (still with rate limiting and CSRF)
 */
export function createPublicRoute(handler: ApiHandler, options?: ApiMiddlewareOptions) {
  return withApiMiddleware(handler, { ...options, requireAuth: false })
}
