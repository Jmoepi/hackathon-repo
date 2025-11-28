import { headers } from "next/headers"
import { NextRequest } from "next/server"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // Max requests per window

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, RATE_LIMIT_WINDOW)

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return "unknown"
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Validate request origin for CSRF protection
 */
export async function validateOrigin(request: NextRequest): Promise<boolean> {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  const host = request.headers.get("host")

  // Allow requests without origin (same-origin requests from some browsers)
  if (!origin && !referer) {
    return true
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    `http://${host}`,
    `https://${host}`,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean)

  // Check origin
  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed as string))) {
    return true
  }

  // Check referer
  if (referer && allowedOrigins.some((allowed) => referer.startsWith(allowed as string))) {
    return true
  }

  return false
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  
  return result
}

/**
 * Hash sensitive data (for logging purposes)
 */
export async function hashForLogging(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16)
}

/**
 * Security headers for API responses
 */
export const apiSecurityHeaders = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
}

/**
 * Create secure API response
 */
export function secureJsonResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...apiSecurityHeaders,
      ...additionalHeaders,
    },
  })
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string
): Response {
  return secureJsonResponse(
    {
      error: message,
      code: code || "ERROR",
      timestamp: new Date().toISOString(),
    },
    status
  )
}
