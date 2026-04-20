'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ICONS, avatarColors } from '@/lib/constants'

type AttendanceRecord = {
  id: string
  volunteerProfileId: string
  eventId: string
  status: 'PRESENT' | 'ABSENT' | 'UNMARKED'
  hoursLogged: number
  volunteerProfile: {
    name: string
    user: { email: string }
  }
}

export default function AttendanceTracking() {
  const [events, setEvents] = useState<{ id: string, title: string }[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [roster, setRoster] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("All")
  const [q, setQ] = useState("")

  useEffect(() => { loadEvents() }, [])
  useEffect(() => { if (selectedEventId) loadRoster() }, [selectedEventId])

  async function loadEvents() {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
        if (data.length > 0) setSelectedEventId(data[0].id)
      }
    } catch (e) { console.error(e) }
  }

  async function loadRoster() {
    setLoading(true)
    try {
      const res = await fetch(`/api/attendance?eventId=${selectedEventId}`)
      if (res.ok) setRoster(await res.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function markAttendance(volProfileId: string, status: 'PRESENT' | 'ABSENT', hours = 2) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          volunteerProfileId: volProfileId, 
          eventId: selectedEventId, 
          status, 
          hoursLogged: hours 
        })
      })
      if (res.ok) loadRoster()
    } catch (e) { console.error(e) }
  }

  const filtered = roster.filter(v => {
    const matchSearch = v.volunteerProfile.name.toLowerCase().includes(q.toLowerCase())
    const matchFilter = filter === "All" || (filter === v.status)
    return matchSearch && matchFilter
  })

  const presentCount = roster.filter(v => v.status === "PRESENT").length
  const absentCount = roster.filter(v => v.status === "ABSENT").length
  const unmarkedCount = roster.filter(v => v.status === "UNMARKED").length

  return (
    <div style={{ display: "flex" }}>
      <Sidebar 
        role="ADMIN" 
        userName="Super Admin" 
        userRoleLabel="Administrator" 
        avatarLetter="A" 
        accentColor="var(--admin)" 
      />
      <div className="main-wrap">
        <Topbar title="Attendance Tracking" />
        <div className="content">
          <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label style={{ display: "block", fontSize: ".8rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Select Event</label>
              <div style={{ position: "relative" }}>
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid var(--border)", fontFamily: "'Nunito',sans-serif", fontSize: ".9rem", fontWeight: 700, appearance: "none", outline: "none", cursor: "pointer", background: "var(--surface)" }}>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
                <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>▼</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <label style={{ display: "block", fontSize: ".8rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Search Volunteer</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.search} /></svg>
                <input type="text" placeholder="Search by name..." value={q} onChange={e => setQ(e.target.value)} style={{ padding: "12px 16px 12px 42px", borderRadius: 10 }} />
              </div>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
            <div style={{ background: "linear-gradient(135deg,var(--primary),#B04420)", borderRadius: "var(--radius)", padding: 22, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: "#fff" }}><path d={ICONS.people} /></svg></div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, letterSpacing: .5 }}>EXPECTED</div>
              </div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2.4rem", fontWeight: 700, lineHeight: 1 }}>{roster.length}</div>
            </div>
            <div style={{ background: "var(--surface)", border: `2px solid var(--border)`, borderRadius: "var(--radius)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--secondary-pale)", color: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>✅</div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: .5 }}>PRESENT</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2.4rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{presentCount}</div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--secondary)" }}>
                  {Math.round((presentCount / (roster.length || 1)) * 100)}% attendance
                </div>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: `2px solid var(--border)`, borderRadius: "var(--radius)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fde8e8", color: "#c0392b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>❌</div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: .5 }}>ABSENT</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2.4rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{absentCount}</div>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: `2px solid var(--border)`, borderRadius: "var(--radius)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8e8fd", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>⏳</div>
                <div style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: .5 }}>UNMARKED</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2.4rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{unmarkedCount}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header" style={{ padding: "16px 20px" }}>
              <span className="panel-title">Roster</span>
              <div style={{ display: "flex", gap: 8 }}>
                {["All", "PRESENT", "ABSENT", "UNMARKED"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={filter === f ? "btn btn-primary" : "btn btn-ghost"} style={{ fontSize: ".72rem", padding: "6px 12px", height: "auto" }}>{f}</button>
                ))}
              </div>
            </div>
            <table>
              <thead><tr><th>Volunteer</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: 40 }}>Loading roster...</td></tr>
                ) : filtered.map((v, i) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColors[i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: ".85rem" }}>{v.volunteerProfile.name[0]}</div>
                        <div>
                           <div style={{ fontSize: ".88rem", fontWeight: 700 }}>{v.volunteerProfile.name}</div>
                           <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{v.volunteerProfile.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${v.status === 'PRESENT' ? 'badge-green' : v.status === 'ABSENT' ? 'badge-red' : 'badge-amber'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button 
                          onClick={() => markAttendance(v.volunteerProfileId, "PRESENT")}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "var(--secondary-pale)", color: "var(--secondary)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: ".75rem" }}
                        >
                          Mark Present
                        </button>
                        <button 
                          onClick={() => markAttendance(v.volunteerProfileId, "ABSENT")}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "#FEF2F2", color: "#991B1B", fontWeight: 700, border: "none", cursor: "pointer", fontSize: ".75rem" }}
                        >
                          Mark Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && <tr><td colSpan={3} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No volunteers found in this category.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
