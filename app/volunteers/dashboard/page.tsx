'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ICONS, avatarColors } from '@/lib/constants'

type VolunteerProfile = {
  id: string
  name: string
  totalHours: number
  area: { name: string }
  volunteerSkills: { skill: { name: string } }[]
}

type EventAssignment = {
  id: string
  status: string
  event: {
    id: string
    title: string
    date: string
    location: string
    status: string
  }
}

type AttendanceRecord = {
  id: string
  status: string
  hoursLogged: number
  markedAt: string
  event: {
    title: string
    date: string
  }
}

export default function VolunteerDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [events, setEvents] = useState<EventAssignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [profileRes, eventsRes, attendanceRes] = await Promise.all([
        fetch('/api/volunteers/me'),
        fetch('/api/events'),
        fetch('/api/attendance')
      ])

      if (profileRes.ok) setProfile(await profileRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
      if (attendanceRes.ok) setAttendance(await attendanceRes.json())
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const presentCount = attendance.filter(a => a?.status === 'PRESENT').length
  const absentCount = attendance.filter(a => a?.status === 'ABSENT').length
  const upcomingEvents = events.filter(e => e?.event?.status === 'UPCOMING')

  const initials = profile?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) || 'V'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex' }}>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon" style={{
            background: 'linear-gradient(135deg,var(--primary),var(--accent))'
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: '#fff' }}>
              <path d={ICONS.heart} />
            </svg>
          </div>
          <div>
            <div className="brand-name">SevaConnect</div>
            <span className="brand-role" style={{ color: 'var(--primary)' }}>Volunteer Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section">My Dashboard</span>
          <button
            className={`nav-item ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d={ICONS.home} />
            </svg>
            Overview
          </button>

          <span className="nav-section">Participate</span>
          <button
            className={`nav-item ${tab === 'events' ? 'active' : ''}`}
            onClick={() => setTab('events')}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d={ICONS.calendar} />
            </svg>
            My Events
          </button>

          <span className="nav-section">Records</span>
          <button
            className={`nav-item ${tab === 'participation' ? 'active' : ''}`}
            onClick={() => setTab('participation')}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d={ICONS.reports} />
            </svg>
            Participation History
          </button>
          <button
            className={`nav-item ${tab === 'attendance' ? 'active' : ''}`}
            onClick={() => setTab('attendance')}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d={ICONS.attendance} />
            </svg>
            Attendance
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar-sm" style={{
              background: 'linear-gradient(135deg,var(--primary),var(--accent))'
            }}>
              {initials}
            </div>
            <div>
              <div className="user-name">{profile?.name || 'Volunteer'}</div>
              <div className="user-role-text" style={{ color: 'var(--primary)' }}>Volunteer</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24"><path d={ICONS.logout} /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrap">
        <div className="topbar">
          <span className="topbar-title">
            {tab === 'overview' && 'Dashboard'}
            {tab === 'events' && 'My Events'}
            {tab === 'participation' && 'Participation History'}
            {tab === 'attendance' && 'My Attendance'}
          </span>
        </div>

        <div className="content">

          {/* ── Overview Tab ── */}
          {tab === 'overview' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div className="stats-grid">
                <div className="stat-card" style={{
                  background: 'linear-gradient(135deg,var(--primary),var(--primary-h))',
                  color: '#fff', border: 'none'
                }}>
                  <div className="stat-number">{profile?.totalHours || 0}</div>
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,.8)' }}>Total Hours</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{upcomingEvents.length}</div>
                  <div className="stat-label">Upcoming Events</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{presentCount}</div>
                  <div className="stat-label">Events Attended</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {attendance.length > 0
                      ? Math.round((presentCount / attendance.length) * 100)
                      : 0}%
                  </div>
                  <div className="stat-label">Attendance Rate</div>
                </div>
              </div>

              {/* Profile Card */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">My Profile</span>
                </div>
                <div className="panel-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'linear-gradient(135deg,var(--primary),var(--accent))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#fff', fontSize: '1.4rem', flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', fontWeight: 700 }}>
                        {profile?.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '.85rem', fontWeight: 600, marginTop: 4 }}>
                        📍 {profile?.area?.name}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {profile?.volunteerSkills?.map(vs => (
                          <span key={vs.skill.name} className="badge badge-green">
                            {vs.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events Preview */}
              {upcomingEvents.length > 0 && (
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Upcoming Events</span>
                    <button className="btn btn-ghost" onClick={() => setTab('events')}>
                      View All
                    </button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingEvents.slice(0, 3).map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 700 }}>{a.event.title}</td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {new Date(a.event.date).toLocaleDateString()}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{a.event.location}</td>
                          <td>
                            <span className="badge badge-amber">{a.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── My Events Tab ── */}
          {tab === 'events' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">My Assigned Events</span>
                </div>
                {events.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>📅</div>
                    <div>You have no assigned events yet.</div>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 700 }}>{a.event.title}</td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {new Date(a.event.date).toLocaleDateString()}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{a.event.location}</td>
                          <td>
                            <span className={`badge ${
                              a.event.status === 'UPCOMING' ? 'badge-amber' :
                              a.event.status === 'COMPLETED' ? 'badge-green' : 'badge-red'
                            }`}>
                              {a.event.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── Participation History Tab ── */}
          {tab === 'participation' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Previous Events</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                            No history found.
                          </td>
                        </tr>
                      ) : attendance.map((a, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{a.event.title}</td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {new Date(a.event.date).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                            {a.hoursLogged}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Impact Summary</span>
                  </div>
                  <div className="panel-body">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: "'Fraunces',serif",
                        fontSize: '3rem', fontWeight: 700,
                        color: 'var(--primary)', lineHeight: 1
                      }}>
                        {profile?.totalHours || 0}
                      </div>
                      <div style={{
                        fontSize: '.85rem', fontWeight: 700,
                        color: 'var(--text-muted)', marginTop: 8
                      }}>
                        Total Hours Contributed
                      </div>
                      <div style={{
                        marginTop: 20, padding: 16,
                        background: 'var(--secondary-pale)',
                        borderRadius: 12
                      }}>
                        <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--admin)' }}>
                          🌱 {attendance.length} events participated
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Attendance Tab ── */}
          {tab === 'attendance' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                <div className="stat-card">
                  <div className="stat-number">{attendance.length}</div>
                  <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: 'var(--secondary)' }}>
                    {presentCount}
                  </div>
                  <div className="stat-label">Present</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: '#c0392b' }}>
                    {absentCount}
                  </div>
                  <div className="stat-label">Absent</div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Attendance Record</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Hours</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                          No attendance records found.
                        </td>
                      </tr>
                    ) : attendance.map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{a.event.title}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {new Date(a.event.date).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 700 }}>{a.hoursLogged}h</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge ${
                            a.status === 'PRESENT' ? 'badge-green' :
                            a.status === 'ABSENT' ? 'badge-red' : 'badge-amber'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}