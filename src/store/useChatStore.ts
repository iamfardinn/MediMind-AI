import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useAuthStore } from './useAuthStore'

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

export interface VitalEntry {
  date: string
  heartRate: number
  bloodPressureSys: number
  bloodPressureDia: number
  temperature: number
  oxygenSat: number
}

const DEFAULT_VITALS: VitalEntry[] = [
  { date: 'Jan', heartRate: 72, bloodPressureSys: 120, bloodPressureDia: 80, temperature: 98.6, oxygenSat: 98 },
  { date: 'Feb', heartRate: 75, bloodPressureSys: 118, bloodPressureDia: 78, temperature: 98.4, oxygenSat: 97 },
  { date: 'Mar', heartRate: 70, bloodPressureSys: 122, bloodPressureDia: 82, temperature: 98.7, oxygenSat: 99 },
  { date: 'Apr', heartRate: 78, bloodPressureSys: 125, bloodPressureDia: 83, temperature: 98.5, oxygenSat: 98 },
  { date: 'May', heartRate: 74, bloodPressureSys: 119, bloodPressureDia: 79, temperature: 98.6, oxygenSat: 97 },
  { date: 'Jun', heartRate: 76, bloodPressureSys: 121, bloodPressureDia: 81, temperature: 98.8, oxygenSat: 98 },
]

// ── localStorage helpers scoped by user UID ──────────────────────────────────
function storageKey(uid: string) {
  return `medimind-chat-${uid}`
}

function saveToStorage(uid: string, messages: Message[], vitals: VitalEntry[]) {
  try {
    const payload = JSON.stringify({ messages, vitals })
    localStorage.setItem(storageKey(uid), payload)
  } catch { /* quota exceeded — silently fail */ }
}

function loadFromStorage(uid: string): { messages: Message[]; vitals: VitalEntry[] } {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    if (!raw) return { messages: [], vitals: [...DEFAULT_VITALS] }
    const parsed = JSON.parse(raw)
    return {
      messages: (parsed.messages ?? []).map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
      vitals: parsed.vitals?.length ? parsed.vitals : [...DEFAULT_VITALS],
    }
  } catch {
    return { messages: [], vitals: [...DEFAULT_VITALS] }
  }
}

// ── Store definition ─────────────────────────────────────────────────────────
interface ChatStore {
  /** UID of the user whose data is currently loaded (null = logged-out) */
  _uid: string | null
  messages: Message[]
  isStreaming: boolean
  streamingText: string
  vitals: VitalEntry[]
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void
  setStreaming: (val: boolean) => void
  setStreamingText: (text: string) => void
  appendStreamingText: (chunk: string) => void
  finalizeStream: () => void
  clearMessages: () => void
  addVital: (entry: VitalEntry) => void
  /** Called internally when the auth user changes */
  _switchUser: (uid: string | null) => void
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    _uid: null,
    messages: [],
    isStreaming: false,
    streamingText: '',
    vitals: [...DEFAULT_VITALS],

    addMessage: (msg) =>
      set((state) => ({
        messages: [
          ...state.messages,
          { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
        ],
      })),

    setStreaming: (val) => set({ isStreaming: val }),
    setStreamingText: (text) => set({ streamingText: text }),
    appendStreamingText: (chunk) =>
      set((state) => ({ streamingText: state.streamingText + chunk })),

    finalizeStream: () => {
      const { streamingText, addMessage } = get()
      if (streamingText.trim()) {
        addMessage({ role: 'assistant', content: streamingText })
      }
      set({ streamingText: '', isStreaming: false })
    },

    clearMessages: () => set({ messages: [] }),

    addVital: (entry) =>
      set((state) => ({ vitals: [...state.vitals, entry] })),

    _switchUser: (newUid) => {
      const { _uid: prevUid, messages: prevMsgs, vitals: prevVitals } = get()

      // 1. Persist current user's data before switching
      if (prevUid && prevMsgs.length > 0) {
        saveToStorage(prevUid, prevMsgs, prevVitals)
      }

      // 2. Load new user's data (or clear for logout)
      if (newUid) {
        const { messages, vitals } = loadFromStorage(newUid)
        set({ _uid: newUid, messages, vitals, isStreaming: false, streamingText: '' })
      } else {
        set({ _uid: null, messages: [], vitals: [...DEFAULT_VITALS], isStreaming: false, streamingText: '' })
      }
    },
  }))
)

// ── Auto-persist on every message change ─────────────────────────────────────
useChatStore.subscribe(
  (s) => s.messages,
  (messages) => {
    const uid = useChatStore.getState()._uid
    if (uid && messages.length > 0) {
      saveToStorage(uid, messages, useChatStore.getState().vitals)
    }
  },
)

// ── React to auth changes — switch user data automatically ───────────────────
function syncUserChat() {
  const uid = useAuthStore.getState().user?.uid ?? null
  const currentUid = useChatStore.getState()._uid
  if (uid !== currentUid) {
    useChatStore.getState()._switchUser(uid)
  }
}

// Run once on load (handles page refresh with persisted auth)
syncUserChat()

// Run on every future auth change (login / logout / switch account)
useAuthStore.subscribe(syncUserChat)
