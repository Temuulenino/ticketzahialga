import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { User } from '@/types/auth.types'
import { setAuthTokens, clearAuthCookies } from '@/services/api'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  pendingEmail: string | null
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  setPendingEmail: (email: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingEmail: null,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (access, refresh) => {
        setAuthTokens(access, refresh)
      },

      setPendingEmail: (email) => set({ pendingEmail: email }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        clearAuthCookies()
        set({ user: null, isAuthenticated: false, pendingEmail: null })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingEmail: state.pendingEmail,
      }),
    }
  )
)
