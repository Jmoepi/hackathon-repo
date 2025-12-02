import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const errorParam = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const type = searchParams.get("type") // 'recovery' for password reset, 'signup' for email confirmation

  // Handle OAuth errors
  if (errorParam) {
    console.error("OAuth error:", errorParam, errorDescription)
    // For password reset errors, redirect to forgot-password page
    if (type === "recovery") {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?error=${encodeURIComponent(errorParam)}&error_description=${encodeURIComponent(errorDescription || "")}`
      )
    }
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_error&message=${encodeURIComponent(errorDescription || errorParam)}`
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.session) {
        // Check if this is a password recovery flow
        if (type === "recovery") {
          // Redirect to reset password page - user is now authenticated and can change password
          return NextResponse.redirect(`${origin}/auth/reset-password`)
        }

        // Get the user after successful session exchange
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Check if profile exists, if not create one from user metadata
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single()
          
          if (!existingProfile) {
            // Create profile from user metadata (stored during signup)
            const metadata = user.user_metadata || {}
            const profileData = {
              id: user.id,
              email: user.email,
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
              console.error("Error creating profile in callback:", profileError.message)
            } else {
              console.log("Profile created successfully for user:", user.id)
            }
          }
        }
        
        // Validate redirect URL to prevent open redirect attacks
        const safeRedirect = validateRedirectUrl(next) ? next : "/dashboard"
        return NextResponse.redirect(`${origin}${safeRedirect}`)
      }

      console.error("Session exchange error:", error?.message || "Unknown error")
    } catch (err) {
      console.error("Auth callback error:", err)
    }
  }

  // Return the user to login page with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

/**
 * Validate redirect URL to prevent open redirect attacks
 * Only allow relative URLs starting with /
 */
function validateRedirectUrl(url: string): boolean {
  // Must start with / and not with // (protocol-relative URL)
  if (!url.startsWith("/") || url.startsWith("//")) {
    return false
  }

  // Check for URL manipulation attempts
  const suspicious = [
    "javascript:",
    "data:",
    "vbscript:",
    "@",
    "\\",
  ]

  const lowerUrl = url.toLowerCase()
  return !suspicious.some((s) => lowerUrl.includes(s))
}
