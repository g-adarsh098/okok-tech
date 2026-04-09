import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const BOT_INTRO = "Hello! I'm the OkokTechie requirements assistant. Tell me about the software or feature you'd like to build, and I'll help refine it into a clear technical brief."

export default function Chat({ onAdmin }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: BOT_INTRO }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [finalizing, setFinalizing] = useState(false)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const apiMessages = newMessages
        .filter(m => m.role !== 'assistant' || m.content !== BOT_INTRO)
        .map(({ role, content }) => ({ role, content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const chunk = JSON.parse(line.slice(6))
              fullContent += chunk.content
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullContent }
                return updated
              })
            } catch {}
          }
        }
      }

      if (fullContent.includes('SUMMARY_GENERATED')) {
        const summaryText = fullContent.replace('SUMMARY_GENERATED', '').trim()
        setSummary(summaryText)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: "✅ I've gathered enough information to create your technical brief. Review the summary below and confirm to finalize."
          }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠️ Something went wrong. Please try again.'
        }
        return updated
      })
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const handleFinalize = async () => {
    if (!email) return alert('Please enter your email.')
    setFinalizing(true)
    try {
      await axios.post('/api/finalize-requirements', {
        clientId: 'client_' + Date.now(),
        chatHistory: messages,
        summary,
        email
      })
      setDone(true)
    } catch {
      alert('Finalization failed. Please try again.')
    }
    setFinalizing(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#A78BFA' }}>All Done!</h2>
          <p className="text-gray-400 mb-6 mono text-sm">Your requirements have been saved to the dashboard and a confirmation has been sent to <span className="text-white">{email}</span>.</p>
          <button
            onClick={onAdmin}
            className="px-6 py-3 rounded-lg text-sm font-semibold mono"
            style={{ background: '#4F46E5', color: '#fff' }}
          >
            View Admin Dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0F14' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1E2130' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#4F46E5' }}>O</div>
          <span className="font-bold text-lg tracking-tight">OkokTechie</span>
          <span className="text-xs px-2 py-0.5 rounded-full mono" style={{ background: '#1E2130', color: '#A78BFA' }}>Requirements Bot</span>
        </div>
        <button
          onClick={onAdmin}
          className="text-xs mono px-3 py-1.5 rounded-lg transition-all"
          style={{ background: '#1E2130', color: '#9CA3AF' }}
          onMouseEnter={e => e.target.style.color = '#E8E6F0'}
          onMouseLeave={e => e.target.style.color = '#9CA3AF'}
        >
          Admin →
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`slide-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mr-3 mt-1" style={{ background: '#4F46E5' }}>AI</div>
            )}
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={msg.role === 'user'
                ? { background: '#4F46E5', color: '#fff', borderBottomRightRadius: 4 }
                : { background: '#161922', color: '#E8E6F0', borderBottomLeftRadius: 4, border: '1px solid #1E2130' }
              }
            >
              {msg.content || <span className="cursor-blink">▋</span>}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mr-3" style={{ background: '#4F46E5' }}>AI</div>
            <div className="px-4 py-3 rounded-2xl text-sm mono" style={{ background: '#161922', border: '1px solid #1E2130' }}>
              <span className="cursor-blink">▋</span>
            </div>
          </div>
        )}

        {/* Summary card */}
        {summary && (
          <div className="slide-up rounded-2xl p-5 border" style={{ background: '#0F1320', borderColor: '#4F46E5' }}>
            <p className="text-xs mono mb-3" style={{ color: '#A78BFA' }}>// TECHNICAL BRIEF</p>
            <p className="text-sm leading-relaxed text-gray-300 mb-5">{summary}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm mono outline-none"
                style={{ background: '#1E2130', border: '1px solid #2A2D3A', color: '#E8E6F0' }}
              />
              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: finalizing ? '#2A2D3A' : '#4F46E5', color: '#fff' }}
              >
                {finalizing ? 'Saving...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!summary && (
        <div className="px-4 pb-6 max-w-3xl mx-auto w-full">
          <div className="flex gap-3 items-end p-2 rounded-2xl" style={{ background: '#161922', border: '1px solid #1E2130' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Describe your project idea..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none px-3 py-2 text-sm leading-relaxed"
              style={{ color: '#E8E6F0', maxHeight: 120 }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: loading || !input.trim() ? '#1E2130' : '#4F46E5' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p className="text-center text-xs mt-2 mono" style={{ color: '#3A3D4A' }}>Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  )
}
