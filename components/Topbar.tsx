'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { ICONS } from '@/lib/constants'

type TopbarProps = {
  title: string
  actions?: React.ReactNode
}

export default function Topbar({ title, actions }: TopbarProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const [pending, setPending] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchPending()
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isAdmin])

  async function fetchPending() {
    try {
      const res = await fetch('/api/volunteers/pending')
      if (res.ok) setPending(await res.json())
    } catch (e) { console.error(e) }
  }

  async function handleAction(id: string, action: 'APPROVE' | 'REJECT') {
    try {
      const res = await fetch('/api/volunteers/pending', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerProfileId: id, action })
      })
      if (res.ok) {
        fetchPending()
        // If we are on the volunteer management page, it should ideally refresh, 
        // but we can just let the user refresh manually for now
      }
    } catch (e) { console.error(e) }
  }

  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {actions}
        
        {isAdmin && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              className="btn btn-ghost" 
              style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', position: 'relative', borderRadius: '50%' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
                <path d={ICONS.bell || 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'} />
              </svg>
              {pending.length > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4, width: 8, height: 8, 
                  background: '#c0392b', borderRadius: '50%', boxShadow: '0 0 0 2px var(--surface)'
                }} />
              )}
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0, 
                width: 320, background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                zIndex: 100, overflow: 'hidden'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                  Notifications ({pending.length})
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {pending.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                      No new sign-ups pending approval.
                    </div>
                  ) : pending.map(p => (
                    <div key={p.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{p.user.email} • {p.area?.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleAction(p.id, 'APPROVE')} className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: '.75rem', background: 'var(--primary)' }}>Approve</button>
                        <button onClick={() => handleAction(p.id, 'REJECT')} className="btn btn-ghost" style={{ flex: 1, padding: '6px', fontSize: '.75rem', color: '#c0392b' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
