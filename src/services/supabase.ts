import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local\n' +
    'Get them from: https://supabase.com → Your Project → Settings → API'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// ── Types ──
export interface ChatMessage {
  id?: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface UserVital {
  id?: string
  user_id: string
  date: string
  heart_rate?: number
  blood_pressure_sys?: number
  blood_pressure_dia?: number
  temperature?: number
  oxygen_sat?: number
  created_at?: string
}

// ── Chat Messages ──
export const saveChatMessage = async (userId: string, message: { role: 'user' | 'assistant'; content: string }) => {
  const { data, error } = await supabase.from('chat_messages').insert({
    user_id: userId,
    role: message.role,
    content: message.content,
  }).select()

  if (error) {
    console.error('Error saving chat message:', error)
    return null
  }
  return data?.[0]
}

export const getChatHistory = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching chat history:', error)
    return []
  }
  return data?.reverse() || []
}

export const deleteChatMessage = async (messageId: string) => {
  const { error } = await supabase.from('chat_messages').delete().eq('id', messageId)

  if (error) {
    console.error('Error deleting message:', error)
    return false
  }
  return true
}

// ── Vitals ──
export const saveVital = async (userId: string, vital: Omit<UserVital, 'id' | 'user_id' | 'created_at'>) => {
  const { data, error } = await supabase.from('user_vitals').insert({
    user_id: userId,
    ...vital,
  }).select()

  if (error) {
    console.error('Error saving vital:', error)
    return null
  }
  return data?.[0]
}

export const getVitals = async (userId: string, limit = 30) => {
  const { data, error } = await supabase
    .from('user_vitals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching vitals:', error)
    return []
  }
  return data?.reverse() || []
}

// ── User Profiles ──
export const upsertUserProfile = async (userId: string, profile: {
  email?: string
  display_name?: string
  avatar_url?: string
  plan_id?: string
}) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...profile,
    })
    .select()

  if (error) {
    console.error('Error upserting user profile:', error)
    return null
  }
  return data?.[0]
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (not an error)
    console.error('Error fetching user profile:', error)
  }
  return data || null
}
