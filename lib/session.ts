"use client"

interface Business {
  id?: string
  name: string
  businessType: string
  description?: string
  address?: string
  phone?: string
  email?: string
}

interface Vendor {
  id: string
  fullName: string
  email?: string
  phoneNumber: string
  role: string
  dateOfBirth?: string | null
  wallet_no?: string | null
  wallet_balance?: number | null
  bank_name?: string | null
  onboardingStep: number
  isOnboardingComplete: boolean
  profileImage?: string | null
  business?: Business | null
}

interface Session {
  user: Vendor
  token: string
  timestamp: number
  rememberMe: boolean
  expiresAt: number
}

// Session duration constants
const SESSION_DURATIONS = {
  SHORT: 24 * 60 * 60 * 1000, // 24 hours (1 day)
  LONG: 7 * 24 * 60 * 60 * 1000, // 7 days instead of 30 days
} as const

// Session storage utilities with improved error handling
export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null

  try {
    const session = localStorage.getItem("session")
    if (!session) return null

    const parsedSession = JSON.parse(session) as Session

    // Check if session is expired using the expiresAt timestamp
    const now = new Date().getTime()

    if (now > parsedSession.expiresAt) {
      console.log("Session expired, clearing...")
      clearSession()
      return null
    }

    // Ensure business data is properly structured if it exists
    if (parsedSession.user && parsedSession.user.business) {
      parsedSession.user = {
        ...parsedSession.user,
        business: parsedSession.user.business || null,
      }
    }

    return parsedSession
  } catch (error) {
    console.error("Error parsing session:", error)
    clearSession()
    return null
  }
}

// Update the setSession function to handle remember me preference
export const setSession = (session: Omit<Session, "timestamp" | "expiresAt">) => {
  try {
    const now = new Date().getTime()
    const duration = session.rememberMe ? SESSION_DURATIONS.LONG : SESSION_DURATIONS.SHORT

    // Ensure business data is properly structured
    const userWithBusiness = {
      ...session.user,
      business: session.user.business || null,
    }

    const sessionWithTimestamp: Session = {
      user: userWithBusiness,
      token: session.token,
      rememberMe: session.rememberMe,
      timestamp: now,
      expiresAt: now + duration,
    }

    localStorage.setItem("session", JSON.stringify(sessionWithTimestamp))
    localStorage.setItem("lastActivity", now.toString())

    console.log(`Session set with ${session.rememberMe ? "30 days" : "24 hours"} duration`)
  } catch (error) {
    console.error("Error saving session:", error)
  }
}

export const clearSession = () => {
  try {
    localStorage.removeItem("session")
    localStorage.removeItem("lastActivity")
  } catch (error) {
    console.error("Error clearing session:", error)
  }
}

export const updateSessionUser = (updatedUser: Vendor) => {
  try {
    const currentSession = getSession()
    if (!currentSession) {
      console.warn("No active session to update")
      return false
    }

    setSession({
      user: updatedUser,
      token: currentSession.token,
      rememberMe: currentSession.rememberMe,
    })
    return true
  } catch (error) {
    console.error("Error updating session user:", error)
    return false
  }
}

export const getSessionUser = (): Vendor | null => {
  const session = getSession()
  return session?.user || null
}

export const getSessionToken = (): string | null => {
  const session = getSession()
  return session?.token || null
}

export const isSessionValid = (): boolean => {
  const session = getSession()
  return !!session?.user && !!session?.token
}

export const getSessionAge = (): number => {
  const session = getSession()
  if (!session?.timestamp) return 0

  const now = new Date().getTime()
  return now - session.timestamp
}

export const getSessionTimeRemaining = (): number => {
  const session = getSession()
  if (!session?.expiresAt) return 0

  const now = new Date().getTime()
  return Math.max(0, session.expiresAt - now)
}

export const getSessionExpiryInfo = (): {
  timeRemaining: number
  expiresAt: Date
  rememberMe: boolean
  isExpiringSoon: boolean
} | null => {
  const session = getSession()
  if (!session) return null

  const timeRemaining = getSessionTimeRemaining()
  const isExpiringSoon = timeRemaining < 2 * 60 * 60 * 1000 // Less than 2 hours

  return {
    timeRemaining,
    expiresAt: new Date(session.expiresAt),
    rememberMe: session.rememberMe,
    isExpiringSoon,
  }
}

export const refreshSessionTimestamp = () => {
  try {
    const session = getSession()
    if (session) {
      setSession({
        user: session.user,
        token: session.token,
        rememberMe: session.rememberMe,
      })
    }
  } catch (error) {
    console.error("Error refreshing session timestamp:", error)
  }
}

export const getLastActivity = (): number => {
  try {
    const lastActivity = localStorage.getItem("lastActivity")
    return lastActivity ? Number.parseInt(lastActivity, 10) : 0
  } catch (error) {
    console.error("Error getting last activity:", error)
    return 0
  }
}

export const updateLastActivity = () => {
  try {
    localStorage.setItem("lastActivity", new Date().getTime().toString())
  } catch (error) {
    console.error("Error updating last activity:", error)
  }
}

export const shouldRefreshSession = (): boolean => {
  const session = getSession()
  if (!session?.timestamp) return false

  const now = new Date().getTime()
  const sessionAge = now - session.timestamp
  const refreshThreshold = 12 * 60 * 60 * 1000 // 12 hours

  return sessionAge > refreshThreshold
}

// Export types for use in other files
export type { Session, Vendor, Business }
export { SESSION_DURATIONS }
