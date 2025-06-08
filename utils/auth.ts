// Token management utilities
const TOKEN_KEY = "vendor_auth_token"
const USER_KEY = "vendor_user_data"

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getUserData = (): any | null => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem(USER_KEY)
  return userData ? JSON.parse(userData) : null
}

export const setUserData = (user: any): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const removeUserData = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem(USER_KEY)
}
