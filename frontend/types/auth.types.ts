export type UserRole = 'user' | 'admin' | 'super_admin'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone: string
  avatar_url: string | null
  bio: string
  role: UserRole
  is_verified: boolean
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface RegisterPayload {
  email: string
  first_name: string
  last_name: string
  phone?: string
  password: string
  confirm_password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface OTPPayload {
  email: string
  code: string
  purpose: 'verify_email' | 'reset_password'
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}
