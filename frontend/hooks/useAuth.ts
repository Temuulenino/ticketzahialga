'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { getApiErrorMessage } from '@/services/api'
import Cookies from 'js-cookie'
import { LoginPayload, RegisterPayload, OTPPayload } from '@/types/auth.types'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setUser, setTokens, setPendingEmail, logout: storeLogout } = useAuthStore()

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await authService.register(data)
    setPendingEmail(data.email)
    return res.data
  }, [setPendingEmail])

  const login = useCallback(async (data: LoginPayload) => {
    const res = await authService.login(data)
    const { access, refresh, user: userData } = res.data.data
    setTokens(access, refresh)
    setUser(userData)
    return userData
  }, [setTokens, setUser])

  const verifyOTP = useCallback(async (data: OTPPayload) => {
    const res = await authService.verifyOTP(data)
    const { access, refresh, user: userData } = res.data.data
    if (access && refresh && userData) {
      setTokens(access, refresh)
      setUser(userData)
    }
    return res.data
  }, [setTokens, setUser])

  const logout = useCallback(async () => {
    const refresh = Cookies.get('refresh_token')
    try {
      if (refresh) await authService.logout(refresh)
    } catch {
      // Proceed with logout even if API call fails
    } finally {
      storeLogout()
      router.push('/login')
    }
  }, [storeLogout, router])

  return { user, isAuthenticated, register, login, verifyOTP, logout }
}
