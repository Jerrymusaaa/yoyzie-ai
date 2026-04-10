import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
  accountCategory: string
  accountType: string
  emailVerified: boolean
  status: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user, token) => {
        Cookies.set('accessToken', token, { expires: 1 })
        set({ user, isAuthenticated: true })
      },

      clearAuth: () => {
        Cookies.remove('accessToken')
        set({ user: null, isAuthenticated: false })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'yoyzie-auth' }
  )
)
