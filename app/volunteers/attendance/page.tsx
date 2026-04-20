'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

type AttendanceRecord = {
  id: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  hoursLogged: number
  markedAt: string
  event: {
    title: string
    date: string
  }
}

type AssignmentRecord = {
  id: string
  status: string
  event: {
    id: string
    title: string
    date: string
  }
}

export default function VolunteerAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const profRes = await fetch('/api/volunteers/me')
      if (profRes.ok) setProfile(await profRes.json())

      const res = await fetch('/api/attendance')
      if (res.ok) setAttendance(await res.json())

      // Also get assignments to identify unmarked ones
      const assignRes = await fetch('/api/events')
      if (assignRes.ok) setAssignments(await assignRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // Build unified list: attendance records + unmarked assignments
  const attendanceEventIds = new Set(attendance.map(a => a.event?.title))
  
  type DisplayRow = {
    id: string
    eventTitle: string
    eventDate: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'UNMARKED'
    hoursLogged: number
  }

  const rows: DisplayRow[] = [
    ...attendance.map(a => ({
      id: a.id,
      eventTitle: a.event.title,
      eventDate: a.event.date,
      status: a.status as DisplayRow['status'],
      hoursLogged: a.hoursLogged
    })),
    // Assignments that have no attendance record = UNMARKED
    ...assignments
      .filter(a => a.status === 'CONFIRMED' && !attendanceEventIds.has(a.event.title))
      .map(a => ({
        id: 'unmark-' + a.id,
        eventTitle: a.event.title,
        eventDate: a.event.date,
        status: 'UNMARKED' as const,
        hoursLogged: 0
      }))
  ]

  const filteredRows = filter ? rows.filter(r => r.status === filter) : rows

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'badge-green'
      case 'ABSENT': return 'badge-gray'
      case 'LATE': return 'badge-amber'
      case 'UNMARKED': return 'badge-amber'
      default: return 'badge-gray'
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
        <Topbar title="My Attendance" />
        
        <div className="content">
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              ["✅", "var(--secondary-pale)", rows.filter(r => r.status === 'PRESENT').length, "Present"],
              ["❌", "#fde8e8", rows.filter(r => r.status === 'ABSENT').length, "Absent"],
              ["⏳", "#e8e8fd", rows.filter(r => r.status === 'UNMARKED').length, "Unmarked"],
            ].map(([ic, bg, n, l]) => (
              <div key={l as string} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: bg as string, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{ic}</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-muted)", fontWeight: 600 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {['', 'PRESENT', 'ABSENT', 'UNMARKED'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                style={{ 
                  padding: "7px 16px", borderRadius: 8, 
                  background: filter === f ? "var(--primary)" : "var(--surface)", 
                  color: filter === f ? "#fff" : "var(--text-muted)",
                  border: filter === f ? "none" : "1px solid var(--border)",
                  fontFamily: "'Nunito',sans-serif", fontSize: ".8rem", fontWeight: 700, cursor: "pointer"
                }}
              >
                {f || 'All'}
              </button>
            ))}
          </div>

          <div className="panel" style={{ maxWidth: 900 }}>
            <div className="panel-header">
              <span className="panel-title">Attendance Record</span>
            </div>
            <div className="panel-body">
              {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading records...</div>
              ) : filteredRows.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No records found.</div>
              ) : (
                <table style={{ minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Hours</th>
                      <th style={{ textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 700 }}>{a.eventTitle}</td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {new Date(a.eventDate).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>{a.hoursLogged}h</td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`badge ${statusBadge(a.status)}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
