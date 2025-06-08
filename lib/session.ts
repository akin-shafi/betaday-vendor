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
}

// Session storage utilities with improved error handling
export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null

  try {
    const session = localStorage.getItem("session")
    if (!session) return null

    const parsedSession = JSON.parse(session) as Session

    // Check if session is expired (24 hours)
    const now = new Date().getTime()
    const sessionAge = now - (parsedSession.timestamp || 0)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (sessionAge > maxAge) {
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

// Update the setSession function to ensure business data is preserved
export const setSession = (session: Omit<Session, "timestamp">) => {
  try {
    // Ensure business data is properly structured
    const userWithBusiness = {
      ...session.user,
      business: session.user.business || null,
    }

    const sessionWithTimestamp: Session = {
      user: userWithBusiness,
      token: session.token,
      timestamp: new Date().getTime(),
    }

    localStorage.setItem("session", JSON.stringify(sessionWithTimestamp))
    localStorage.setItem("lastActivity", new Date().getTime().toString())
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

    setSession({ user: updatedUser, token: currentSession.token })
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

export const refreshSessionTimestamp = () => {
  try {
    const session = getSession()
    if (session) {
      setSession({ user: session.user, token: session.token })
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

// Export types for use in other files
export type { Session, Vendor, Business }
