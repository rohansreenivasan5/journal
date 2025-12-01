/**
 * Get the correct URL for the current environment
 * Follows Supabase's recommended pattern for Vercel deployments
 * See: https://supabase.com/docs/guides/auth/redirect-urls#vercel-preview-urls
 */
export function getSiteURL(): string {
  // In client-side code, always prefer window.location.origin for accuracy
  if (typeof window !== 'undefined') {
    // If we have an explicit env var that's not localhost, use it
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
    }
    // Otherwise use the current page origin (most reliable for client-side)
    return window.location.origin
  }

  // Server-side: use environment variables
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000'
  
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  
  // Remove trailing slash for consistency
  url = url.endsWith('/') ? url.slice(0, -1) : url
  
  return url
}

