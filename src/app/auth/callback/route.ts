import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Get the correct origin for redirect
  // Vercel sets x-forwarded-host header, use it if available
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocalEnv = process.env.NODE_ENV === 'development'
  
  let redirectOrigin = origin
  
  if (!isLocalEnv && forwardedHost) {
    // In production (Vercel), use the forwarded host
    redirectOrigin = `${forwardedProto}://${forwardedHost}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure next starts with /
      const redirectPath = next.startsWith('/') ? next : `/${next}`
      return NextResponse.redirect(`${redirectOrigin}${redirectPath}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${redirectOrigin}/auth/auth-code-error`)
}

