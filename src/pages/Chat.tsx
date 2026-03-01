import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Bot, User, Loader2, Brain } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useChatStore } from '../store/useChatStore'
import { streamGeminiResponse } from '../services/copilot'

const MD_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>['components'] = {}

function MdContent({ children }: { children: string }) {
  return (
    <div className="chat-bubble-md">
      <ReactMarkdown components={MD_COMPONENTS}>{children}</ReactMarkdown>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-sky-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function Chat() {
  const { messages, isStreaming, streamingText, addMessage, setStreaming, appendStreamingText, finalizeStream, clearMessages } = useChatStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    addMessage({ role: 'user', content: text })
    setInput('')
    setStreaming(true)

    await streamGeminiResponse(
      text,
      (chunk) => appendStreamingText(chunk),
      () => finalizeStream(),
      (err) => {
        addMessage({ role: 'assistant', content: `⚠️ Error: ${err}. Please try again.` })
        finalizeStream()
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    'I have a headache and fever',
    'What are symptoms of diabetes?',
    'Tips for better sleep',
    'I feel chest tightness',
  ]

  return (
    <div
      style={{ maxWidth: '860px', margin: '0 auto' }}
      className="flex flex-col h-[calc(100vh-64px)] px-3 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-2"
        style={{ marginBottom: '1.25rem' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-white leading-tight">MediMind AI Assistant</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Powered by GitHub Copilot
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-3" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
            style={{ gap: '1.5rem', padding: '1rem' }}
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20 flex items-center justify-center">
              <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">How can I help you today?</h2>
              <p className="text-slate-400 text-sm max-w-sm sm:max-w-md">Ask me anything about your health, symptoms, medications, or wellness tips.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm sm:max-w-lg">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                  className="text-left text-xs sm:text-sm px-3 py-3 sm:px-4 sm:py-3.5 rounded-xl glass hover:border-sky-500/30 hover:text-white text-slate-400 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '9999px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isUser
                    ? 'linear-gradient(135deg,#6366f1,#9333ea)'
                    : 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
                }}>
                  {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                </div>

                {/* Bubble */}
                <div style={{
                  display: 'inline-block',
                  maxWidth: 'min(82%, 640px)',
                  minWidth: 0,
                  flexShrink: 1,
                  flexGrow: 0,
                  padding: '0.6rem 0.875rem',
                  borderRadius: isUser ? '1.1rem 0.2rem 1.1rem 1.1rem' : '0.2rem 1.1rem 1.1rem 1.1rem',
                  fontSize: '0.8rem',
                  lineHeight: '1.65',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  background: isUser
                    ? 'linear-gradient(135deg,#0ea5e9,#6366f1)'
                    : 'rgba(30,41,59,0.85)',
                  border: isUser ? 'none' : '1px solid rgba(148,163,184,0.12)',
                  backdropFilter: isUser ? 'none' : 'blur(12px)',
                  color: '#f1f5f9',
                }}>
                  {isUser ? (
                    <p style={{ margin: 0 }}>{msg.content}</p>
                  ) : (
                    <MdContent>{msg.content}</MdContent>
                  )}
                  <p style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '0.35rem', textAlign: 'right' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Streaming bubble */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '0.5rem' }}
          >
            <div style={{
              width: '1.75rem', height: '1.75rem', borderRadius: '9999px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
            }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div style={{
              display: 'inline-block',
              maxWidth: 'min(82%, 640px)',
              minWidth: 0,
              flexShrink: 1,
              flexGrow: 0,
              padding: '0.6rem 0.875rem',
              borderRadius: '0.2rem 1.1rem 1.1rem 1.1rem',
              fontSize: '0.8rem',
              lineHeight: '1.65',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              background: 'rgba(30,41,59,0.85)',
              border: '1px solid rgba(148,163,184,0.12)',
              backdropFilter: 'blur(12px)',
              color: '#f1f5f9',
            }}>
              {streamingText ? <MdContent>{streamingText}</MdContent> : <TypingIndicator />}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '0.75rem' }}>
        <div className="glass rounded-2xl flex items-end gap-2 sm:gap-3 focus-within:border-sky-500/40 transition-colors"
             style={{ padding: '0.65rem 0.75rem' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a health question..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed"
            style={{ minHeight: '36px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-sky-400 hover:to-indigo-400 transition-all duration-200"
          >
            {isStreaming
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-1.5">
          MediMind AI is not a substitute for professional medical advice.
        </p>
      </motion.div>
    </div>
  )
}
