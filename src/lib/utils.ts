/**
 * Get the correct URL for the current environment
 * Uses NEXT_PUBLIC_SITE_URL if set, otherwise falls back to window.location.origin
 * This ensures correct redirects in both local and production environments
 */
export function getSiteURL(): string {
  // In server-side contexts, use environment variable
  if (typeof window === 'undefined') {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    }
    return 'http://localhost:3000'
  }

  // In client-side contexts, prefer environment variable but fall back to window.location
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) {
    return envUrl
  }

  // Fall back to window.location.origin
  return window.location.origin
}

