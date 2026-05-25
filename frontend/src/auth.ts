const TOKEN_KEY = 'kaamil_token'
const EMAIL_KEY = 'kaamil_email'
const ROLE_KEY = 'kaamil_role'
const NAME_KEY = 'kaamil_name'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY)
}

export function getUserEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}

export function getUserName(): string | null {
  return localStorage.getItem(NAME_KEY)
}

export function setSession(token: string, email: string, role: string, fullName: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
  localStorage.setItem(ROLE_KEY, role)
  localStorage.setItem(NAME_KEY, fullName)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(NAME_KEY)
}

export function isAdmin(): boolean {
  return getRole() === 'Admin'
}
