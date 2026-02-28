import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface ChatStore {
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
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      streamingText: '',
      vitals: [
        { date: 'Jan', heartRate: 72, bloodPressureSys: 120, bloodPressureDia: 80, temperature: 98.6, oxygenSat: 98 },
        { date: 'Feb', heartRate: 75, bloodPressureSys: 118, bloodPressureDia: 78, temperature: 98.4, oxygenSat: 97 },
        { date: 'Mar', heartRate: 70, bloodPressureSys: 122, bloodPressureDia: 82, temperature: 98.7, oxygenSat: 99 },
        { date: 'Apr', heartRate: 78, bloodPressureSys: 125, bloodPressureDia: 83, temperature: 98.5, oxygenSat: 98 },
        { date: 'May', heartRate: 74, bloodPressureSys: 119, bloodPressureDia: 79, temperature: 98.6, oxygenSat: 97 },
        { date: 'Jun', heartRate: 76, bloodPressureSys: 121, bloodPressureDia: 81, temperature: 98.8, oxygenSat: 98 },
      ],
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
    }),
    { name: 'medimind-storage' }
  )
)
