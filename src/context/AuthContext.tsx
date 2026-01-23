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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        // PGRST116 means no rows found - profile doesn't exist yet (not an error)
        if (error.code === 'PGRST116') {
          console.log("Profile not found for user, will be created on first update")
          return null
        }
        // Log actual error details for debugging
        console.warn("Error fetching profile:", {
          message: error.message || "Unknown error",
          code: error.code,
          details: error.details,
        })
        return null
      }

      return data as Profile
    } catch (err) {
      // Handle unexpected errors gracefully
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.warn("Exception fetching profile:", errorMessage)
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
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.warn("Error getting session:", sessionError.message || "Unknown error")
          setIsLoading(false)
          return
        }
        
        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
          const profileData = await fetchProfile(initialSession.user.id)
          setProfile(profileData)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        console.warn("Error initializing auth:", errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (event: any, currentSession: any) => {
        try {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          if (currentSession?.user) {
            // Fetch profile when user signs in
            const profileData = await fetchProfile(currentSession.user.id)
            setProfile(profileData)
          } else {
            setProfile(null)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          console.warn("Error in auth state change:", errorMessage)
          // Still clear profile on error to prevent stale data
          if (!currentSession?.user) {
            setProfile(null)
          }
        } finally {
          setIsLoading(false)
        }
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
        // Log detailed error for debugging
        console.error("Signup error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code,
        });
        
        // Create user-friendly error message for signup errors
        const errorCode = error.message?.toLowerCase() || '';
        const status = error.status;
        
        // Handle 401 specifically - usually means email signup is disabled
        if (status === 401) {
          error.message = 'Unable to create account. Please ensure email signup is enabled in your Supabase dashboard (Authentication → Providers → Email).';
        } else if (errorCode.includes('user already registered') || errorCode.includes('already exists')) {
          error.message = 'An account with this email already exists. Please sign in instead.';
        } else if (errorCode.includes('invalid email')) {
          error.message = 'Please enter a valid email address.';
        } else if (errorCode.includes('password') && errorCode.includes('weak')) {
          error.message = 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
        } else if (errorCode.includes('rate limit') || errorCode.includes('too many')) {
          error.message = 'Too many signup attempts. Please wait a few minutes before trying again.';
        } else if (errorCode.includes('network') || errorCode.includes('fetch')) {
          error.message = 'Unable to connect. Please check your internet connection and try again.';
        } else if (errorCode.includes('signups not allowed') || errorCode.includes('signup disabled')) {
          error.message = 'New signups are currently disabled. Please contact support.';
        }
        
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
        
        // Also try to get additional data from localStorage (saved during signup)
        let registrationData: Record<string, string | boolean> | null = null
        try {
          const savedProfile = localStorage.getItem("tradahub-profile")
          if (savedProfile) {
            registrationData = JSON.parse(savedProfile)
          }
        } catch (e) {
          console.warn("Could not parse registration data:", e)
        }
        
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
            business_name: metadata.business_name || registrationData?.businessName as string || "My Business",
            first_name: metadata.first_name || registrationData?.firstName as string,
            last_name: metadata.last_name || registrationData?.lastName as string,
            phone: metadata.phone || registrationData?.phone as string,
            business_type: metadata.business_type || registrationData?.businessType as string,
            business_description: registrationData?.businessDescription as string,
            business_address: metadata.business_address || registrationData?.streetAddress as string,
            business_city: registrationData?.city as string,
            business_province: registrationData?.province as string,
            business_postal_code: registrationData?.postalCode as string,
            business_phone: registrationData?.businessPhone as string,
            id_number: registrationData?.idNumber as string,
            date_of_birth: registrationData?.dateOfBirth as string,
            vat_number: metadata.vat_number || registrationData?.vatNumber as string,
            receipt_header: metadata.receipt_header || registrationData?.receiptHeader as string,
            receipt_footer: metadata.receipt_footer || registrationData?.receiptFooter as string,
          }

          const { error: profileError } = await supabase
            .from("profiles")
            .insert(profileData)

          if (profileError) {
            console.error("Error creating profile after OTP verification:", profileError.message)
          } else {
            // Clear registration data from localStorage after successful profile creation
            localStorage.removeItem("tradahub-profile")
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

  // Helper function to get user-friendly error message
  const getAuthErrorMessage = (error: AuthError): string => {
    const errorCode = error.message?.toLowerCase() || '';
    const status = (error as any).status;
    
    // Handle 401 Unauthorized - invalid credentials
    if (status === 401 || errorCode.includes('invalid login credentials') || errorCode.includes('invalid_credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    // Handle specific error messages
    if (errorCode.includes('email not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for a confirmation link.';
    }
    
    if (errorCode.includes('user not found') || errorCode.includes('no user found')) {
      return 'No account found with this email. Please sign up first.';
    }
    
    if (errorCode.includes('too many requests') || errorCode.includes('rate limit')) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    
    if (errorCode.includes('network') || errorCode.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }
    
    if (errorCode.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    if (errorCode.includes('password')) {
      return 'Password is incorrect. Please try again or reset your password.';
    }
    
    // Default message
    return error.message || 'An error occurred during sign in. Please try again.';
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Update error message in place with user-friendly version
        error.message = getAuthErrorMessage(error);
        return { error };
      }

      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      // For unexpected errors, return a generic auth error
      return { 
        error: {
          message: 'An unexpected error occurred. Please try again.',
          name: 'AuthError',
          status: 500,
        } as unknown as AuthError 
      }
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
        // Use callback route to exchange the token, with type=recovery to indicate password reset
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        // Provide user-friendly error messages
        const errorCode = error.message?.toLowerCase() || '';
        
        if (errorCode.includes('user not found') || errorCode.includes('no user')) {
          error.message = 'No account found with this email address.';
        } else if (errorCode.includes('rate limit') || errorCode.includes('too many')) {
          error.message = 'Too many reset requests. Please wait a few minutes before trying again.';
        } else if (errorCode.includes('network') || errorCode.includes('fetch')) {
          error.message = 'Unable to connect. Please check your internet connection.';
        }
      }

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

      if (error) {
        // Provide user-friendly error messages
        const errorCode = error.message?.toLowerCase() || '';
        
        if (errorCode.includes('weak') || errorCode.includes('password')) {
          error.message = 'Password is too weak. Please use at least 8 characters with letters and numbers.';
        } else if (errorCode.includes('same password') || errorCode.includes('different')) {
          error.message = 'New password must be different from your current password.';
        } else if (errorCode.includes('session') || errorCode.includes('expired')) {
          error.message = 'Your session has expired. Please request a new password reset link.';
        } else if (errorCode.includes('network') || errorCode.includes('fetch')) {
          error.message = 'Unable to connect. Please check your internet connection.';
        }
      }

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
