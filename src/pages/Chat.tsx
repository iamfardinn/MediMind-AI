import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Bot, User, Loader2, Brain } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useChatStore } from '../store/useChatStore'
import { streamGeminiResponse } from '../services/gemini'

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

  return (    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 2.5rem 2rem 2.5rem' }}
         className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
        style={{ marginBottom: '1.75rem' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center animate-pulse-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MediMind AI Assistant</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Powered by Gemini 2.0 Flash
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
      </motion.div>      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}            className="flex flex-col items-center justify-center h-full text-center gap-8"
          >
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20 flex items-center justify-center">
              <Brain className="w-12 h-12 text-sky-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">How can I help you today?</h2>
              <p className="text-slate-400 max-w-md">Ask me anything about your health, symptoms, medications, or wellness tips.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                  className="text-left text-sm px-4 py-3.5 rounded-xl glass hover:border-sky-500/30 hover:text-white text-slate-400 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-linear-to-br from-indigo-500 to-purple-600'
                  : 'bg-linear-to-br from-sky-500 to-cyan-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              {/* Bubble */}              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-linear-to-br from-sky-600 to-indigo-600 text-white rounded-tr-sm'
                  : 'glass text-slate-100 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:text-sky-300 prose-strong:text-white prose-code:text-emerald-300">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming message */}
        {isStreaming && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full shrink-0 bg-linear-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[78%] rounded-2xl rounded-tl-sm glass px-4 py-3 text-sm text-slate-100">
              {streamingText ? (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-sky-300 prose-strong:text-white">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              ) : (
                <TypingIndicator />
              )}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginTop: '1.5rem' }}
      >
        <div className="glass rounded-2xl p-4 flex items-end gap-3 focus-within:border-sky-500/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a health question..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed max-h-32"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-sky-400 hover:to-indigo-400 transition-all duration-200 glow"
          >
            {isStreaming
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">
          MediMind AI is not a substitute for professional medical advice.
        </p>
      </motion.div>
    </div>
  )
}
