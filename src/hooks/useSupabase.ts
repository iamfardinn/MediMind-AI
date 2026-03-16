import { useCallback } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import {
  saveChatMessage,
  getChatHistory,
  deleteChatMessage,
  saveVital,
  getVitals,
  upsertUserProfile,
  getUserProfile,
  type UserVital,
} from '../services/supabase'

export function useSupabase() {
  const { user } = useAuthStore()

  // Chat messages
  const createChatMessage = useCallback(
    async (message: { role: 'user' | 'assistant'; content: string }) => {
      if (!user) return null
      return saveChatMessage(user.uid, message)
    },
    [user]
  )

  const fetchChatHistory = useCallback(async (limit?: number) => {
    if (!user) return []
    return getChatHistory(user.uid, limit)
  }, [user])

  const removeChatMessage = useCallback(async (messageId: string) => {
    if (!user) return false
    return deleteChatMessage(messageId)
  }, [user])

  // Vitals
  const createVital = useCallback(
    async (vital: Omit<UserVital, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) return null
      return saveVital(user.uid, vital)
    },
    [user]
  )

  const fetchVitals = useCallback(async (limit?: number) => {
    if (!user) return []
    return getVitals(user.uid, limit)
  }, [user])

  // User profile
  const updateProfile = useCallback(
    async (profile: {
      email?: string
      display_name?: string
      avatar_url?: string
      plan_id?: string
    }) => {
      if (!user) return null
      return upsertUserProfile(user.uid, profile)
    },
    [user]
  )

  const fetchProfile = useCallback(async () => {
    if (!user) return null
    return getUserProfile(user.uid)
  }, [user])

  return {
    // Chat
    createChatMessage,
    fetchChatHistory,
    removeChatMessage,
    // Vitals
    createVital,
    fetchVitals,
    // Profile
    updateProfile,
    fetchProfile,
    // Current user
    user,
    isAuthenticated: !!user,
  }
}
