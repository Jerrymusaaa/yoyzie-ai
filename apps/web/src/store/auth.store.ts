import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string
  accountType: string
  accountCategory: string
  emailVerified: boolean
  plan?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  clearAuth: () => void
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user, token) => {
        Cookies.set('accessToken', token, { expires: 1 })
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token)
        }
        set({ user, accessToken: token, isAuthenticated: true })
      },

      clearAuth: () => {
        Cookies.remove('accessToken')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      logout: async () => {
        try {
          const token = Cookies.get('accessToken')
          if (token) {
            await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            })
          }
        } catch {}
        Cookies.remove('accessToken')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
        }
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      updateUser: (userData) =>
        set((state) => ({ user: state.user ? { ...state.user, ...userData } : null })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
