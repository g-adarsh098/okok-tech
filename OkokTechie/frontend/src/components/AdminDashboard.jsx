import { useState, useEffect } from 'react'
import axios from 'axios'

const STATUS_COLORS = {
  NEW: { bg: '#1a2040', text: '#60A5FA', dot: '#3B82F6' },
  REVIEWED: { bg: '#1a2b1a', text: '#4ADE80', dot: '#22C55E' },
  COMPLETED: { bg: '#2b1a2b', text: '#C084FC', dot: '#A855F7' },
  REJECTED: { bg: '#2b1a1a', text: '#F87171', dot: '#EF4444' },
}

export default function AdminDashboard({ onBack }) {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchRequirements = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/requirements')
      setRequirements(data)
    } catch {
      console.error('Failed to fetch')
    }
    setLoading(false)
  }

  useEffect(() => { fetchRequirements() }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await axios.patch(`/api/requirements/${id}`, { status })
      setRequirements(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
    } catch {
      alert('Update failed')
    }
    setUpdating(null)
  }

  const fmt = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0F14' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1E2130' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#4F46E5' }}>O</div>
          <span className="font-bold text-lg tracking-tight">OkokTechie</span>
          <span className="text-xs px-2 py-0.5 rounded-full mono" style={{ background: '#1E2130', color: '#A78BFA' }}>Admin Dashboard</span>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchRequirements} className="text-xs mono px-3 py-1.5 rounded-lg" style={{ background: '#1E2130', color: '#9CA3AF' }}>↻ Refresh</button>
          <button onClick={onBack} className="text-xs mono px-3 py-1.5 rounded-lg" style={{ background: '#1E2130', color: '#9CA3AF' }}>← Back to Chat</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* List Panel */}
        <aside className="w-full sm:w-80 border-r overflow-y-auto" style={{ borderColor: '#1E2130' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: '#1E2130' }}>
            <p className="text-xs mono" style={{ color: '#9CA3AF' }}>{requirements.length} requirement{requirements.length !== 1 ? 's' : ''} total</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#4F46E5', borderTopColor: 'transparent' }} />
            </div>
          ) : requirements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <p className="text-gray-600 text-sm mono">No requirements yet.</p>
              <p className="text-gray-700 text-xs mt-1">Go chat with the bot first!</p>
            </div>
          ) : (
            requirements.map(req => {
              const sc = STATUS_COLORS[req.status] || STATUS_COLORS.NEW
              const isActive = selected?.id === req.id
              return (
                <button
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className="w-full text-left px-4 py-4 border-b transition-all"
                  style={{
                    borderColor: '#1E2130',
                    background: isActive ? '#161922' : 'transparent',
                    borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent'
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold mono" style={{ color: '#A78BFA' }}>{req.projectId}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full mono" style={{ background: sc.bg, color: sc.text }}>{req.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{req.details?.slice(0, 80)}...</p>
                  <p className="text-xs mt-1" style={{ color: '#3A3D4A' }}>{fmt(req.createdAt)}</p>
                </button>
              )
            })
          )}
        </aside>

        {/* Detail Panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-600 mono text-sm">← Select a requirement to view details</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl slide-up">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selected.projectId}</h2>
                  <p className="text-xs mono mt-1" style={{ color: '#9CA3AF' }}>Client: {selected.clientId} · {fmt(selected.createdAt)}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {['NEW', 'REVIEWED', 'COMPLETED', 'REJECTED'].map(s => {
                    const sc = STATUS_COLORS[s]
                    const isCurrentStatus = selected.status === s
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        disabled={updating === selected.id || isCurrentStatus}
                        className="text-xs px-3 py-1.5 rounded-lg mono transition-all"
                        style={{
                          background: isCurrentStatus ? sc.bg : '#1E2130',
                          color: isCurrentStatus ? sc.text : '#9CA3AF',
                          opacity: updating === selected.id ? 0.5 : 1
                        }}
                      >
                        {isCurrentStatus && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: sc.dot }} />}
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl p-5 mb-5" style={{ background: '#161922', border: '1px solid #1E2130' }}>
                <p className="text-xs mono mb-3" style={{ color: '#A78BFA' }}>// TECHNICAL BRIEF</p>
                <p className="text-sm leading-relaxed text-gray-300">{selected.details}</p>
              </div>

              {/* Chat Log */}
              <div className="rounded-xl p-5" style={{ background: '#161922', border: '1px solid #1E2130' }}>
                <p className="text-xs mono mb-4" style={{ color: '#A78BFA' }}>// CONVERSATION LOG</p>
                <div className="space-y-3">
                  {(() => {
                    try {
                      return JSON.parse(selected.fullLog).map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                            style={msg.role === 'user'
                              ? { background: '#4F46E5', color: '#fff' }
                              : { background: '#0D0F14', color: '#D1D5DB', border: '1px solid #1E2130' }
                            }
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    } catch {
                      return <p className="text-xs text-gray-600">Log unavailable.</p>
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
