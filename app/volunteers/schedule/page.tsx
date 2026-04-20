'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ICONS } from '@/lib/constants'

type Assignment = {
  id: string
  status: string
  event: {
    id: string
    title: string
    date: string
    location: string
    status: string
    category?: string
    description?: string
    estimatedHours?: number
    slots?: number
  }
}

export default function MySchedule() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detailEvent, setDetailEvent] = useState<Assignment | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const profRes = await fetch('/api/volunteers/me')
      if (profRes.ok) setProfile(await profRes.json())

      const res = await fetch('/api/events')
      if (res.ok) setAssignments(await res.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'Environment': return '🌿'
      case 'Education': return '📚'
      case 'Food & Nutrition': return '🍱'
      case 'Healthcare': return '🏥'
      default: return '💡'
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar 
        role="VOLUNTEER" 
        userName={profile?.name || "Volunteer"} 
        userRoleLabel="Volunteer" 
        avatarLetter={profile?.name?.[0] || "V"} 
        accentColor="var(--primary)" 
      />
      
      <div className="main-wrap">
        <Topbar title="My Schedule" />
        
        <div className="content">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Your Registered Events</span>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading your schedule...</div>
              ) : assignments.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>📅</div>
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>You haven't been assigned to any events yet.</div>
                  <p style={{ fontSize: ".85rem", marginTop: 4 }}>Browse and sign up for new opportunities!</p>
                </div>
              ) : assignments.map((reg, i) => {
                const e = reg.event
                const dt = new Date(e.date)

                return (
                  <div key={reg.id} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderBottom: i < assignments.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ 
                      width: 56, height: 56, borderRadius: 14, 
                      background: "var(--primary-pale)", 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      fontSize: "1.6rem" 
                    }}>{getCategoryIcon(e.category)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>{e.title}</span>
                        <span className={`badge ${reg.status === 'CONFIRMED' ? 'badge-green' : reg.status === 'ASSIGNED' ? 'badge-amber' : 'badge-gray'}`}>
                          {reg.status === 'CONFIRMED' ? 'Accepted' : reg.status === 'ASSIGNED' ? 'Pending' : 'Declined'}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: ".85rem", color: "var(--text-muted)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: "currentColor" }}><path d={ICONS.calendar} /></svg>
                          {dt.toLocaleDateString()} · {dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: "currentColor" }}><path d={ICONS.pin} /></svg>
                          {e.location}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={() => setDetailEvent(reg)}>View Details</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {detailEvent && (
        <div className="modal-overlay" onClick={() => setDetailEvent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <span className="modal-title">Event Details</span>
              <button className="modal-close" onClick={() => setDetailEvent(null)}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "linear-gradient(135deg,var(--admin),#2D6A4F)", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
                {getCategoryIcon(detailEvent.event.category)}
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{detailEvent.event.title}</div>
                <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.75)", marginTop: 3 }}>{detailEvent.event.category || 'Community'}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                ["📅 Date", new Date(detailEvent.event.date).toLocaleDateString()],
                ["🕐 Time", new Date(detailEvent.event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })],
                ["📍 Location", detailEvent.event.location],
                ["⏱️ Est. Hours", `${detailEvent.event.estimatedHours || 4} hours`],
                ["👥 Slots", `${detailEvent.event.slots || 20} volunteers`],
                ["📋 Status", detailEvent.event.status]
              ].map(([label, value]) => (
                <div key={label} style={{ background: "var(--bg)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: ".88rem", fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            {detailEvent.event.description && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--text-muted)", marginBottom: 6 }}>Description</div>
                <p style={{ fontSize: ".88rem", lineHeight: 1.6, color: "var(--text)" }}>{detailEvent.event.description}</p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "var(--secondary-pale)", borderRadius: 10 }}>
              <span style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--admin)" }}>Your Status:</span>
              <span className={`badge ${detailEvent.status === 'CONFIRMED' ? 'badge-green' : detailEvent.status === 'ASSIGNED' ? 'badge-amber' : 'badge-gray'}`}>
                {detailEvent.status === 'CONFIRMED' ? 'Accepted' : detailEvent.status === 'ASSIGNED' ? 'Pending' : 'Declined'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
