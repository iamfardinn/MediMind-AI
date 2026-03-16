import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Bot, User, Loader2, Brain, Lock, Sparkles, MessageSquare, Shield, Zap, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { useChatStore } from '../store/useChatStore'
import { streamGeminiResponse } from '../services/copilot'
import { useAuthStore } from '../store/useAuthStore'
import { useUserPlan } from '../hooks/useUserPlan'
import { getRemainingMessages, incrementDailyMessageCount, isAtDailyLimit, FREE_DAILY_LIMIT } from '../services/planGating'

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
  const { user } = useAuthStore()
  const { plan } = useUserPlan()
  const isFree = plan.planId === 'free'
  const remaining = useMemo(() => {
    if (user && isFree) return getRemainingMessages(user.uid)
    return FREE_DAILY_LIMIT
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isFree, messages.length])
  const atLimit = user ? isFree && isAtDailyLimit(user.uid) : false

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // ── Auth Gate ──
  if (!user) {
    const features = [
      { icon: MessageSquare, label: '20 free messages/day', desc: 'Generous daily limit on Free plan' },
      { icon: Brain, label: 'AI health insights', desc: 'Powered by advanced medical AI' },
      { icon: Shield, label: 'Private & secure', desc: 'Your health data stays encrypted' },
      { icon: Zap, label: 'Instant responses', desc: 'Real-time streaming answers' },
    ]

    const mockMessages = [
      { role: 'user' as const, text: 'I have a headache and mild fever' },
      { role: 'bot' as const, text: "Based on your symptoms, this could be related to a viral infection or tension headache. Let me ask a few more questions..." },
      { role: 'user' as const, text: 'Should I take any medication?' },      { role: 'bot' as const, text: 'For mild symptoms, rest and hydration are key. Over-the-counter pain relievers like acetaminophen can help.' },
    ]

    return (
      <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* ── Ambient BG ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full opacity-30"
               style={{ width: '56rem', height: '40rem', background: 'radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 rounded-full opacity-20"
               style={{ width: '34rem', height: '34rem', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
          {[
            { size: 6, x: '10%', y: '18%', delay: 0, c: 'rgba(14,165,233,0.14)' },
            { size: 4, x: '86%', y: '28%', delay: 1.5, c: 'rgba(99,102,241,0.11)' },
            { size: 8, x: '72%', y: '74%', delay: 3, c: 'rgba(14,165,233,0.07)' },
            { size: 3, x: '24%', y: '78%', delay: 2, c: 'rgba(99,102,241,0.09)' },
          ].map((o, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width: `${o.size}rem`, height: `${o.size}rem`, left: o.x, top: o.y, background: o.c, filter: 'blur(20px)' }}
              animate={{ y: [-10, 10, -10], scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, delay: o.delay, ease: 'easeInOut' }} />
          ))}
          <div className="absolute inset-0 opacity-[0.03]"
               style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

                {/* ── Content — vertically + horizontally centered ── */}
        <div className="absolute inset-0 flex items-center justify-center overflow-y-auto px-6 sm:px-10 lg:px-16 py-12">
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* ── Left column ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [.22,1,.36,1] }}
            className="w-full lg:flex-1 max-w-xl flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide mb-9"
              style={{ background: 'rgba(14,165,233,.08)', border: '1px solid rgba(14,165,233,.18)', color: '#7dd3fc' }}>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              AI-Powered Health Assistant
            </motion.div>

            <h1 className="text-3xl leading-tight sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight font-extrabold text-white tracking-tight mb-8">
              Your personal{' '}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">AI health</span>
                <motion.span className="absolute -bottom-1 left-0 h-0.75 rounded-full"
                  style={{ background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}
                  initial={{ width: 0 }} animate={{ width: '100%' }}
                  transition={{ delay: .75, duration: .55, ease: [.22,1,.36,1] }} />
              </span>{' '}
              companion
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-12 max-w-md mx-auto lg:mx-0">
              Ask anything about symptoms, medications, or wellness — get instant, AI-powered answers grounded in medical knowledge.
            </p>            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14 w-full">
              {features.map((f, i) => (
                <motion.div key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: .25 + i * .08 }}
                  className="flex items-start gap-4 p-5 rounded-xl text-left transition-all duration-200 hover:bg-white/5 group"
                  style={{ background: 'rgba(15,23,42,.45)', border: '1px solid rgba(51,65,85,.5)' }}>
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: 'linear-gradient(135deg,rgba(14,165,233,.15),rgba(99,102,241,.15))', border: '1px solid rgba(14,165,233,.15)' }}>
                    <f.icon className="w-4.5 h-4.5 text-sky-400" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-white leading-snug mb-1.5">{f.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-5 mt-4">
              <Link to="/login"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', boxShadow: '0 8px 32px rgba(14,165,233,.25)' }}>
                Sign In to Start Chatting
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-xs text-slate-500 sm:self-center">Free · No credit card required</span>
            </motion.div>
          </motion.div>

          {/* ── Right column — mock chat ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .65, delay: .25, ease: [.22,1,.36,1] }}
            className="hidden lg:block lg:flex-1 w-full max-w-sm xl:max-w-md"
          >
            <div className="relative">

              {/* Glow */}
              <div className="absolute -inset-4 rounded-3xl opacity-40"
                   style={{ background: 'radial-gradient(ellipse at center,rgba(14,165,233,.18),transparent 70%)', filter: 'blur(30px)' }} />

              <div className="relative rounded-2xl overflow-hidden shadow-2xl"
                   style={{ background: 'rgba(15,23,42,.65)', border: '1px solid rgba(51,65,85,.55)', backdropFilter: 'blur(24px)' }}>

                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(51,65,85,.35)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1.5">
                    <Brain className="w-3 h-3 text-sky-400" />
                    <span className="text-[11px] font-medium text-slate-400">MediMind AI Chat</span>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Messages */}
                <div className="p-4 flex flex-col gap-3">
                  {mockMessages.map((msg, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: .45 + i * .18 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-[.9rem_.15rem_.9rem_.9rem] text-white'
                          : 'rounded-[.15rem_.9rem_.9rem_.9rem] text-slate-200'
                      }`} style={{
                        background: msg.role === 'user' ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : 'rgba(30,41,59,.8)',
                        border: msg.role === 'user' ? 'none' : '1px solid rgba(148,163,184,.1)',
                      }}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing dots */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                    className="flex justify-start">
                    <div className="px-3.5 py-2.5 rounded-[.15rem_.9rem_.9rem_.9rem] flex items-center gap-1.5"
                         style={{ background: 'rgba(30,41,59,.8)', border: '1px solid rgba(148,163,184,.1)' }}>
                      {[0,1,2].map(j => (
                        <motion.span key={j} className="w-1.5 h-1.5 rounded-full bg-sky-400/50"
                          animate={{ y: [0,-3,0], opacity: [.35,1,.35] }}
                          transition={{ duration: .75, repeat: Infinity, delay: j * .13 }} />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Locked input */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5"
                       style={{ background: 'rgba(15,23,42,.5)', border: '1px solid rgba(51,65,85,.4)' }}>
                    <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-[12px] text-slate-600 truncate">Sign in to start chatting…</span>
                    <div className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(14,165,233,.12)' }}>
                      <Send className="w-3 h-3 text-sky-500/35" />
                    </div>
                  </div>
                </div>              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    // Check daily limit for free users
    if (isFree && isAtDailyLimit(user.uid)) return
    // Increment counter for free users
    if (isFree) {
      incrementDailyMessageCount(user.uid)
    }

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
    <div className="w-full flex justify-center">
      <div className="flex flex-col w-full max-w-4xl px-3 sm:px-6 md:px-10 pb-5 sm:pb-6"
           style={{ height: 'calc(100vh - 80px)' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 flex items-center justify-between flex-wrap gap-3 pt-5 sm:pt-6 pb-4"
        style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
            <Brain className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight">MediMind AI Assistant</h1>
            <p className="text-[11px] sm:text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Online · Powered by Gemini
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear chat
          </button>
        )}
      </motion.div>

      {/* ── Messages area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto py-5 flex flex-col gap-5">
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 text-center gap-6 px-4"
          >
            <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-sky-500/15 to-indigo-500/15 border border-sky-500/20 flex items-center justify-center">
              <Brain className="w-9 h-9 sm:w-12 sm:h-12 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">How can I help you today?</h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-sm sm:max-w-md leading-relaxed">
                Ask me anything about your health, symptoms, medications, or wellness tips.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-sm sm:max-w-lg mt-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                  className="text-left text-xs sm:text-sm px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5"
                  style={{ border: '1px solid rgba(51,65,85,0.5)' }}
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center shadow-md ${
                  isUser ? 'bg-linear-to-br from-indigo-500 to-purple-600' : 'bg-linear-to-br from-sky-500 to-cyan-500'
                }`}>
                  {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                </div>

                {/* Bubble */}
                <div className={`inline-block max-w-[min(82%,640px)] min-w-0 shrink px-4 py-2.5 text-[0.825rem] leading-relaxed wrap-break-word text-slate-100 ${
                  isUser
                    ? 'rounded-[1.1rem_0.2rem_1.1rem_1.1rem]'
                    : 'rounded-[0.2rem_1.1rem_1.1rem_1.1rem] border border-slate-700/30 backdrop-blur-md'
                }`} style={{
                  background: isUser
                    ? 'linear-gradient(135deg,#0ea5e9,#6366f1)'
                    : 'rgba(30,41,59,0.85)',
                }}>
                  {isUser ? (
                    <p className="m-0">{msg.content}</p>
                  ) : (
                    <MdContent>{msg.content}</MdContent>
                  )}
                  <p className="text-[0.6rem] opacity-40 mt-1.5 text-right">
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-row items-start gap-2.5"
          >
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-linear-to-br from-sky-500 to-cyan-500 shadow-md">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="inline-block max-w-[min(82%,640px)] min-w-0 shrink px-4 py-2.5 rounded-[0.2rem_1.1rem_1.1rem_1.1rem] text-[0.825rem] leading-relaxed wrap-break-word text-slate-100 border border-slate-700/30 backdrop-blur-md"
                 style={{ background: 'rgba(30,41,59,0.85)' }}>
              {streamingText ? <MdContent>{streamingText}</MdContent> : <TypingIndicator />}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Bottom area: plan banner + input ── */}
      <div className="shrink-0 flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid rgba(51,65,85,0.25)' }}>
        {/* Free plan banner */}
        {isFree && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-full max-w-md px-4 py-2.5 rounded-xl bg-sky-950/70 border border-sky-500/25 text-sky-300 text-xs font-semibold flex items-center justify-center gap-2">
              {atLimit
                ? <>You've reached your <span className="font-bold text-sky-200">20 messages</span> daily limit.</>
                : <>Messages today: <span className="font-bold text-sky-200">{remaining} / 20</span> remaining</>}
            </div>
            {atLimit && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] text-slate-500">Upgrade to Standard or Premium for unlimited AI chat.</p>
                <Link to="/pricing"
                  className="px-5 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:scale-105 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', boxShadow: '0 4px 20px rgba(14,165,233,0.25)' }}>
                  Upgrade Plan
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl flex items-end gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 transition-colors focus-within:border-sky-500/40"
               style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.5)', backdropFilter: 'blur(12px)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms or ask a health question..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-slate-500 outline-none leading-relaxed"
              style={{ minHeight: '38px', maxHeight: '120px' }}
              disabled={atLimit}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || atLimit}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-sky-400 hover:to-indigo-400 transition-all duration-200 shadow-md"
            >
              {isStreaming
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-600 mt-2 mb-1">
            MediMind AI is not a substitute for professional medical advice.
          </p>
        </motion.div>
      </div>
    </div>
    </div>
  )
}

