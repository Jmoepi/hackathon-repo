"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Loader2, ShieldAlert } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for auth state to be determined
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store current path for redirect after login
        const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname)}`
        router.replace(redirectUrl)
      } else {
        setIsChecking(false)
      }
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Show loading state
  if (isLoading || isChecking) {
    return (
      fallback || (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-emerald-200 dark:border-emerald-800" />
              <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Verifying authentication...</p>
          </div>
        </div>
      )
    )
  }

  // Show unauthorized state if somehow we got here without auth
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You must be logged in to view this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute fallback={fallback}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }
}

export default ProtectedRoute
