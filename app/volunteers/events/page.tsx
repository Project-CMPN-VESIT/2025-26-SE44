'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ICONS } from '@/lib/constants'

export default function BrowseEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [myAssignments, setMyAssignments] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'invites'>('all')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const profRes = await fetch('/api/volunteers/me')
      if (profRes.ok) setProfile(await profRes.json())

      // Get all events
      const allEventsRes = await fetch('/api/events?all=true')
      if (allEventsRes.ok) setEvents(await allEventsRes.json())
      
      // Get my assignments (invites)
      const assignRes = await fetch('/api/assignments')
      if (assignRes.ok) setMyAssignments(await assignRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleResponse(assignmentId: string, action: 'ACCEPT' | 'REJECT') {
    try {
      const res = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, action })
      })
      if (res.ok) {
        alert(action === 'ACCEPT' ? '🎉 You have accepted the invite!' : 'Invite declined.')
        loadData()
      } else {
        alert("Something went wrong.")
      }
    } catch { alert("Network error") }
  }

  function getMyAssignment(eventId: string) {
    return myAssignments.find(a => a.eventId === eventId)
  }

  // Separate pending invites from other events
  const pendingInvites = myAssignments.filter(a => a.status === 'ASSIGNED')
  const acceptedInvites = myAssignments.filter(a => a.status === 'CONFIRMED')

  const displayEvents = filter === 'invites' 
    ? events.filter(e => myAssignments.some(a => a.eventId === e.id))
    : events

  const getCategoryIcon = (cat: string) => {
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
        <Topbar title="Browse Events" />
        
        <div className="content">
          {/* Stats bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              ["📬", "var(--accent-pale)", pendingInvites.length, "Pending Invites"],
              ["✅", "var(--secondary-pale)", acceptedInvites.length, "Accepted"],
              ["📅", "var(--primary-pale)", events.length, "Total Events"]
            ].map(([ic, bg, n, l]) => (
              <div key={l as string} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: bg as string, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{ic}</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--text-muted)", fontWeight: 600, marginTop: 2 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invites Section */}
          {pendingInvites.length > 0 && (
            <div className="panel" style={{ marginBottom: 24 }}>
              <div className="panel-header">
                <span className="panel-title">📬 Pending Invites ({pendingInvites.length})</span>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {pendingInvites.map((assignment, i) => {
                  const ev = events.find(e => e.id === assignment.eventId) || assignment.event
                  if (!ev) return null
                  const dt = new Date(ev.date)
                  return (
                    <div key={assignment.id} style={{ 
                      padding: "20px 24px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      borderBottom: i < pendingInvites.length - 1 ? "1px solid var(--border)" : "none",
                      background: "var(--accent-pale)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                          {getCategoryIcon(ev.category)}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>{ev.title}</div>
                          <div style={{ display: "flex", gap: 16, fontSize: ".8rem", color: "var(--text-muted)" }}>
                            <span>📅 {dt.toLocaleDateString()}</span>
                            <span>📍 {ev.location}</span>
                            <span className="badge badge-amber" style={{ fontSize: ".7rem" }}>{ev.category}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button 
                          onClick={() => handleResponse(assignment.id, 'ACCEPT')}
                          style={{ padding: "8px 18px", borderRadius: 10, background: "var(--secondary)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: ".85rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                        >
                          ✓ Accept
                        </button>
                        <button 
                          onClick={() => handleResponse(assignment.id, 'REJECT')}
                          style={{ padding: "8px 18px", borderRadius: 10, background: "#fde8e8", color: "#c0392b", fontFamily: "'Nunito',sans-serif", fontSize: ".85rem", fontWeight: 700, border: "1px solid #f5c6c6", cursor: "pointer" }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[['all', 'All Events'], ['invites', 'My Invites']].map(([key, label]) => (
              <button 
                key={key} 
                onClick={() => setFilter(key as any)}
                style={{ 
                  padding: "8px 18px", borderRadius: 10, 
                  background: filter === key ? "var(--primary)" : "var(--surface)", 
                  color: filter === key ? "#fff" : "var(--text-muted)", 
                  border: filter === key ? "none" : "1px solid var(--border)",
                  fontFamily: "'Nunito',sans-serif", fontSize: ".85rem", fontWeight: 700, cursor: "pointer"
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>Loading events...</div>
            ) : displayEvents.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>No events found.</div>
            ) : displayEvents.map((e) => {
              const myReg = getMyAssignment(e.id)
              const dt = new Date(e.date)
              
              let statusButton
              if (!myReg) {
                statusButton = (
                  <div style={{ padding: "10px 0 0", fontSize: ".82rem", color: "var(--text-muted)", textAlign: "center" }}>
                    No invite yet
                  </div>
                )
              } else if (myReg.status === 'ASSIGNED') {
                statusButton = (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" style={{ flex: 1, height: 40, justifyContent: "center", fontSize: ".85rem" }} onClick={() => handleResponse(myReg.id, 'ACCEPT')}>
                      ✓ Accept
                    </button>
                    <button className="btn btn-ghost" style={{ height: 40, justifyContent: "center", fontSize: ".85rem", color: "#c0392b" }} onClick={() => handleResponse(myReg.id, 'REJECT')}>
                      ✕ Reject
                    </button>
                  </div>
                )
              } else if (myReg.status === 'CONFIRMED') {
                statusButton = (
                  <button className="btn btn-ghost" style={{ width: "100%", height: 40, justifyContent: "center", background: "var(--secondary-pale)", color: "var(--secondary)", cursor: "default" }} disabled>
                    ✓ Accepted
                  </button>
                )
              } else {
                statusButton = (
                  <button className="btn btn-ghost" style={{ width: "100%", height: 40, justifyContent: "center", background: "#fde8e8", color: "#c0392b", cursor: "default" }} disabled>
                    Declined
                  </button>
                )
              }

              return (
                <div key={e.id} className="panel" style={{ transition: "all .2s", marginBottom: 0 }}>
                  <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ 
                      width: 50, height: 50, borderRadius: 12, 
                      background: "var(--secondary-pale)", 
                      display: "flex", alignItems: "center", justifyContent: "center", 
                      fontSize: "1.6rem" 
                    }}>{getCategoryIcon(e.category)}</div>
                    <span className="badge badge-green" style={{ fontSize: ".7rem" }}>{e.category || 'Community'}</span>
                  </div>
                  <div style={{ padding: "0 24px 20px" }}>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12, minHeight: 46 }}>{e.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".8rem", color: "var(--text-muted)" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: "currentColor" }}><path d={ICONS.calendar} /></svg>
                        {dt.toLocaleDateString()} · {dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".8rem", color: "var(--text-muted)" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: "currentColor" }}><path d={ICONS.pin} /></svg>
                        {e.location}
                      </div>
                    </div>
                    {statusButton}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
