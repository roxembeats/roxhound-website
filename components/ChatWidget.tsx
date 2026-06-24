'use client'

import { useChat } from 'ai/react'
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import { useAppStore, type Shape } from '@/store/useAppStore'
import PackageCard, { type PackageData } from '@/components/PackageCard'

type Mode = 'qualify' | 'quote'

const MIN_W = 280
const MIN_H = 320
const MAX_W = 1600
const MAX_H = 1200

const SUGGESTIONS = [
  "I'm the bottleneck in my own business",
  "We're growing but everything's breaking",
  'I need AI employees',
  "Our sales process doesn't exist",
  'I need real SOPs',
]


export default function ChatWidget({ mode = 'qualify' }: { mode?: Mode }) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [size, setSize] = useState({ w: 480, h: 600 })

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 640
      setIsMobile(mobile)
      if (!mobile) {
        setSize({
          w: Math.min(480, Math.round(window.innerWidth * 0.45)),
          h: Math.round(window.innerHeight * 0.72),
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const bottomRef = useRef<HTMLDivElement>(null)
  const accentColor = useAppStore((s) => s.accentColor)
  const phase = useAppStore((s) => s.phase)
  const setPhase = useAppStore((s) => s.setPhase)
  const dragState = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/chat`,
    maxSteps: 5,
    body: { mode },
    headers: process.env.NEXT_PUBLIC_CHAT_SECRET
      ? { 'x-chat-secret': process.env.NEXT_PUBLIC_CHAT_SECRET }
      : undefined,
    async onToolCall({ toolCall }) {
      const store = useAppStore.getState()
      const args = toolCall.args as Record<string, unknown>
      switch (toolCall.toolName) {
        case 'setAccentColor':
          store.setAccentColor(String(args.color))
          return `Accent color changed to ${args.color}.`
        case 'setShape':
          store.setShape(args.shape as Shape)
          return `Shape changed to ${args.shape}.`
        case 'setSpinSpeed':
          store.setSpinSpeed(Number(args.speed))
          return `Spin speed set to ${args.speed}.`
        case 'renderPackage':
          return 'Package rendered.'
        default:
          return `Unknown tool: ${toolCall.toolName}`
      }
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLandingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setPhase('chat')
    setOpen(true)
    handleSubmit(e)
  }

  const handleSuggestion = (text: string) => {
    setPhase('chat')
    setOpen(true)
    append({ role: 'user', content: text })
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragState.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h }
    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return
      const { startX, startY, startW, startH } = dragState.current
      setSize({
        w: Math.min(MAX_W, Math.max(MIN_W, startW - (ev.clientX - startX))),
        h: Math.min(MAX_H, Math.max(MIN_H, startH - (ev.clientY - startY))),
      })
    }
    const onUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [size])

  const isLanding = phase === 'landing'

  return (
    <>
      {/* Navbar */}
      <motion.header
        animate={{ opacity: isLanding ? 1 : 0, pointerEvents: isLanding ? 'auto' : 'none' }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-8 py-4 bg-black/40 backdrop-blur-sm"
      >
        <Image src="/logo.PNG" alt="Roxhound" width={40} height={40} unoptimized style={{ filter: 'invert(1)' }} />
      </motion.header>

      {/* Landing — centered prompt box */}
      <motion.div
        animate={{ opacity: isLanding ? 1 : 0, pointerEvents: isLanding ? 'auto' : 'none' }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 flex items-center justify-center px-6 pointer-events-none"
      >
        <form
          onSubmit={handleLandingSubmit}
          className="w-full max-w-2xl bg-black/30 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Tell me what's happening in your business..."
            rows={3}
            style={{ fontSize: 16 }}
            className="w-full resize-none bg-transparent text-white placeholder-white/25 outline-none px-5 pt-5 pb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                e.preventDefault()
                e.currentTarget.closest('form')?.requestSubmit()
              }
            }}
          />
          <div className="flex items-center justify-end px-5 pb-4 pt-1">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/80 transition-colors disabled:opacity-30"
            >
              ↑
            </button>
          </div>
        </form>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {phase === 'chat' && open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className={
              isMobile
                ? 'fixed inset-0 z-40 bg-black flex flex-col overflow-hidden'
                : 'fixed bottom-6 right-6 z-40 bg-black/80 backdrop-blur border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl'
            }
            style={isMobile ? undefined : { width: size.w, height: size.h }}
          >
            {/* Drag handle — desktop only */}
            {!isMobile && (
              <div onMouseDown={onMouseDown} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10 group">
                <svg width="12" height="12" viewBox="0 0 12 12" className="absolute top-1.5 left-1.5 opacity-20 group-hover:opacity-60 transition-opacity rotate-180">
                  <path d="M10 2 L2 2 L2 10" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
                <span className="text-white text-sm font-medium">Roxhound AI</span>
              </div>
              {isMobile && (
                <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white text-2xl leading-none px-1">×</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
              {messages.length === 0 && (
                <p className="text-white/40 text-sm text-center mt-12">Starting your qualification...</p>
              )}
              {messages.map((m) => {
                const pkg = m.toolInvocations?.find((t) => t.toolName === 'renderPackage' && t.state === 'result')
                return (
                  <div key={m.id} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {pkg && <div className="w-full"><PackageCard data={pkg.args as PackageData} /></div>}
                    {(m.content || !pkg) && (
                      <div
                        className="max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed text-white"
                        style={m.role === 'user' ? { background: accentColor } : { background: 'rgba(255,255,255,0.08)' }}
                      >
                        {m.role === 'user' ? m.content : (
                          <ReactMarkdown components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="text-white/90">{children}</li>,
                            h1: ({ children }) => <h1 className="font-bold text-base mb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="font-semibold text-sm mb-1 text-white/80 uppercase tracking-wide">{children}</h2>,
                            h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
                            hr: () => <hr className="border-white/10 my-2" />,
                            code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                          }}>
                            {m.content || (m.toolInvocations?.length ? '…' : '')}
                          </ReactMarkdown>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white/40 px-4 py-2.5 rounded-xl text-sm">…</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t border-white/10 shrink-0"
              style={isMobile ? { paddingBottom: 'max(12px, env(safe-area-inset-bottom))' } : undefined}
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything..."
                  style={{ fontSize: 16 }}
                  className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-white/20"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="text-white rounded-lg px-4 py-3 text-sm transition-opacity disabled:opacity-40"
                  style={{ background: accentColor }}
                >
                  ↑
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button — hidden when mobile panel is open */}
      <AnimatePresence>
        {phase === 'chat' && !(isMobile && open) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen((o) => !o)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
            style={{ background: accentColor, marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <span className="text-white text-xl leading-none">{open ? '×' : '💬'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chips — sticky footer */}
      <motion.div
        animate={{ opacity: isLanding ? 1 : 0, pointerEvents: isLanding ? 'auto' : 'none' }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center gap-3 px-6 py-6"
      >
        <p className="text-white/25 text-xs tracking-widest uppercase">What&apos;s holding you back?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSuggestion(item)}
              className="px-4 py-2 border border-white/10 rounded-full text-sm bg-black/40 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors backdrop-blur-sm"
            >
              {item}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
