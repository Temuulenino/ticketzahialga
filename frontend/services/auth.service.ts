import api from './api'
import { LoginPayload, RegisterPayload, OTPPayload, LoginResponse } from '@/types/auth.types'

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<{ data: { email: string; requires_verification: boolean } }>('/auth/register/', data),

  login: (data: LoginPayload) =>
    api.post<{ data: LoginResponse }>('/auth/login/', data),

  verifyOTP: (data: OTPPayload) =>
    api.post<{ data: LoginResponse }>('/auth/verify-otp/', data),

  resendOTP: (email: string, purpose = 'verify_email') =>
    api.post('/auth/resend-otp/', { email, purpose }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password/', { email }),

  resetPassword: (data: { email: string; code: string; new_password: string; confirm_password: string }) =>
    api.post('/auth/reset-password/', data),

  logout: (refresh: string) =>
    api.post('/auth/logout/', { refresh }),

  refreshToken: (refresh: string) =>
    api.post<{ access: string }>('/auth/token/refresh/', { refresh }),
}
