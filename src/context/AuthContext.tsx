"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import type { Profile, ProfileInsert } from "@/lib/supabase/types"

// Auth state interface
interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Sign up result interface
interface SignUpResult {
  error: AuthError | null
  needsEmailConfirmation?: boolean
}

// Verify OTP result interface
interface VerifyOtpResult {
  error: AuthError | null
  success: boolean
}

// Auth context interface
interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<SignUpResult>
  verifyOtp: (email: string, token: string) => Promise<VerifyOtpResult>
  resendOtp: (email: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
}

// Sign up metadata interface
interface SignUpMetadata {
  first_name?: string
  last_name?: string
  phone?: string
  business_name?: string
  business_type?: string
  business_address?: string
  vat_number?: string
  receipt_header?: string
  receipt_footer?: string
}

// Default context value
const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signUp: async () => ({ error: null, needsEmailConfirmation: false }),
  verifyOtp: async () => ({ error: null, success: false }),
  resendOtp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
}

// Create context
const AuthContext = createContext<AuthContextType>(defaultAuthContext)

// Provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }, [supabase])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
          const profileData = await fetchProfile(initialSession.user.id)
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // Fetch profile when user signs in
          const profileData = await fetchProfile(currentSession.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            // Store profile data in user metadata for later profile creation
            pending_profile: true,
          },
          // Don't use emailRedirectTo - we want OTP verification instead
        },
      })

      if (error) {
        return { error, needsEmailConfirmation: false }
      }

      // Check if email confirmation is required
      // If user.identities is empty or user is not confirmed, email confirmation is needed
      const needsEmailConfirmation = !data.session || 
        (data.user && !data.user.email_confirmed_at) ||
        (data.user?.identities && data.user.identities.length === 0)

      // Only create profile if user is confirmed (has a session)
      // Otherwise, profile will be created via auth callback after email confirmation
      if (data.user && data.session) {
        const profileData: ProfileInsert = {
          id: data.user.id,
          email: email,
          business_name: metadata?.business_name || "My Business",
          first_name: metadata?.first_name,
          last_name: metadata?.last_name,
          phone: metadata?.phone,
          business_type: metadata?.business_type,
          business_address: metadata?.business_address,
          vat_number: metadata?.vat_number,
          receipt_header: metadata?.receipt_header,
          receipt_footer: metadata?.receipt_footer,
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .insert(profileData)

        if (profileError) {
          // Profile might already exist, try upsert
          console.log("Profile insert failed, might already exist:", profileError.message)
        }
      }

      return { error: null, needsEmailConfirmation }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as AuthError, needsEmailConfirmation: false }
    }
  }

  // Verify OTP code sent to email
  const verifyOtp = async (email: string, token: string): Promise<VerifyOtpResult> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      })

      if (error) {
        return { error, success: false }
      }

      // If verification successful and we have a user, create profile
      if (data.user && data.session) {
        const metadata = data.user.user_metadata || {}
        
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single()

        if (!existingProfile) {
          const profileData: ProfileInsert = {
            id: data.user.id,
            email: data.user.email || email,
            business_name: metadata.business_name || "My Business",
            first_name: metadata.first_name,
            last_name: metadata.last_name,
            phone: metadata.phone,
            business_type: metadata.business_type,
            business_address: metadata.business_address,
            vat_number: metadata.vat_number,
            receipt_header: metadata.receipt_header,
            receipt_footer: metadata.receipt_footer,
          }

          const { error: profileError } = await supabase
            .from("profiles")
            .insert(profileData)

          if (profileError) {
            console.error("Error creating profile after OTP verification:", profileError.message)
          }
        }

        // Update local state
        setUser(data.user)
        setSession(data.session)
        const profileData = await fetchProfile(data.user.id)
        setProfile(profileData)
      }

      return { error: null, success: true }
    } catch (error) {
      console.error("Verify OTP error:", error)
      return { error: error as AuthError, success: false }
    }
  }

  // Resend OTP code
  const resendOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      return { error }
    } catch (error) {
      console.error("Resend OTP error:", error)
      return { error: error as AuthError }
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as AuthError }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return { error }
    } catch (error) {
      console.error("Google sign in error:", error)
      return { error: error as AuthError }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        setUser(null)
        setProfile(null)
        setSession(null)
      }

      return { error }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: error as AuthError }
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("No user logged in") }
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null)
      }

      return { error }
    } catch (error) {
      console.error("Update profile error:", error)
      return { error: error as Error }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as AuthError }
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      return { error }
    } catch (error) {
      console.error("Update password error:", error)
      return { error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}

export default AuthContext
