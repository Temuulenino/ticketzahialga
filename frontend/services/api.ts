import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { API_URL } from '@/lib/constants'

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = Cookies.get('refresh_token')
      if (!refreshToken) {
        processQueue(error, null)
        isRefreshing = false
        clearAuthCookies()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })
        const { access } = response.data
        setAccessToken(access)
        processQueue(null, access)
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthCookies()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export function setAuthTokens(access: string, refresh: string) {
  Cookies.set('access_token', access, { expires: 1, secure: true, sameSite: 'Strict' })
  Cookies.set('refresh_token', refresh, { expires: 7, secure: true, sameSite: 'Strict' })
}

export function setAccessToken(access: string) {
  Cookies.set('access_token', access, { expires: 1, secure: true, sameSite: 'Strict' })
}

export function clearAuthCookies() {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0]
      const firstError = data.errors[firstKey]
      const msg = Array.isArray(firstError) ? firstError[0] : firstError
      if (msg && typeof msg === 'string') return msg
    }
    if (data?.message && data.message !== 'Validation error' && data.message !== 'An error occurred') return data.message
    if (typeof data?.detail === 'string') return data.detail
  }
  return 'Алдаа гарлаа. Дахин оролдоно уу.'
}

export default api
