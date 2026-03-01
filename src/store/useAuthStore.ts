import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string | null
}

interface AuthStore {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (val: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser:    (user) => set({ user, loading: false }),
      setLoading: (val)  => set({ loading: val }),
      logout:     ()     => set({ user: null }),
    }),
    { name: 'medimind-auth' }
  )
)
