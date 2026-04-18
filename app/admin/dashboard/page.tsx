'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ICONS, avatarColors } from '@/lib/constants'

type Volunteer = {
  id: string
  name: string
  totalHours: number
  isActive: boolean
  area: { name: string }
  user: { email: string }
  volunteerSkills: { skill: { name: string } }[]
}

type Event = {
  id: string
  title: string
  date: string
  location: string
  status: string
  _count: { eventAssignments: number }
}

type AttendanceRecord = {
  id: string
  status: string
  hoursLogged: number
  volunteerProfile: {
    id: string
    name: string
    user: { email: string }
  }
}

type ReportData = {
  totalVolunteers: number
  activeVolunteers: number
  totalEvents: number
  completedEvents: number
  upcomingEvents: number
  totalHours: number
  topVolunteers: { name: string; totalHours: number; area: { name: string } }[]
  areas: { name: string; _count: { volunteerProfiles: number } }[]
  attendance: { present: number; absent: number }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState('')
  const [sortBy, setSortBy] = useState('totalHours')
  const [filterArea, setFilterArea] = useState('All')
  const [searchQ, setSearchQ] = useState('')
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '' })
  const [assignVolunteerId, setAssignVolunteerId] = useState('')

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (selectedEventId) loadAttendance(selectedEventId) }, [selectedEventId])

  async function loadData() {
    setLoading(true)
    try {
      const [volRes, evRes, repRes] = await Promise.all([
        fetch('/api/volunteers'),
        fetch('/api/events'),
        fetch('/api/reports')
      ])
      if (volRes.ok) setVolunteers(await volRes.json())
      if (evRes.ok) {
        const evData = await evRes.json()
        setEvents(evData)
        if (evData.length > 0) setSelectedEventId(evData[0].id)
      }
      if (repRes.ok) setReportData(await repRes.json())
    } catch (error) { console.error(error) }
    setLoading(false)
  }

  async function loadAttendance(eventId: string) {
    const res = await fetch(`/api/attendance?eventId=${eventId}`)
    if (res.ok) setAttendance(await res.json())
  }

  async function markAttendance(volunteerProfileId: string, eventId: string, status: string, hoursLogged: number) {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerProfileId, eventId, status, hoursLogged })
    })
    if (res.ok) loadAttendance(eventId)
  }

  async function createEvent() {
    console.log('Creating event:', newEvent)
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      alert('Please fill in title, date and location')
      return
    }
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    })
    if (res.ok) {
      setShowEventForm(false)
      setNewEvent({ title: '', description: '', location: '', date: '' })
      loadData()
    } else {
      const err = await res.json()
      alert('Error: ' + err.error)
    }
  }

  async function assignVolunteer(eventId: string, volunteerProfileId: string) {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, volunteerProfileId })
    })
    if (res.ok) { loadData(); alert('Volunteer assigned!') }
    else { const err = await res.json(); alert('Error: ' + err.error) }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const areas = ['All', ...Array.from(new Set(volunteers.map(v => v.area?.name).filter(Boolean)))]
  const filteredVolunteers = volunteers
    .filter(v => {
      const matchSearch = v.name.toLowerCase().includes(searchQ.toLowerCase()) || v.user.email.toLowerCase().includes(searchQ.toLowerCase())
      const matchArea = filterArea === 'All' || v.area?.name === filterArea
      return matchSearch && matchArea
    })
    .sort((a, b) => sortBy === 'totalHours' ? b.totalHours - a.totalHours : a.name.localeCompare(b.name))

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '2px solid var(--border)', borderRadius: 10,
    fontFamily: "'Nunito',sans-serif", fontSize: '.9rem',
    fontWeight: 600, background: 'var(--surface)',
    color: 'var(--text)', outline: 'none'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex' }}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg,var(--admin),#40916C)' }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: '#fff' }}><path d={ICONS.heart} /></svg>
          </div>
          <div>
            <div className="brand-name">SevaConnect</div>
            <span className="brand-role" style={{ color: 'var(--admin)' }}>Admin Portal</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section">Overview</span>
          <button className={`nav-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d={ICONS.home} /></svg>Dashboard
          </button>
          <span className="nav-section">Management</span>
          <button className={`nav-item ${tab === 'volunteers' ? 'active' : ''}`} onClick={() => setTab('volunteers')}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d={ICONS.people} /></svg>Volunteers
          </button>
          <button className={`nav-item ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d={ICONS.calendar} /></svg>Events
          </button>
          <span className="nav-section">Tracking</span>
          <button className={`nav-item ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d={ICONS.attendance} /></svg>Attendance
          </button>
          <span className="nav-section">Insights</span>
          <button className={`nav-item ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d={ICONS.reports} /></svg>Reports
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar-sm" style={{ background: 'linear-gradient(135deg,var(--admin),#40916C)' }}>A</div>
            <div>
              <div className="user-name">Admin</div>
              <div className="user-role-text" style={{ color: 'var(--admin)' }}>Super Admin</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24"><path d={ICONS.logout} /></svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrap">
        <div className="topbar">
          <span className="topbar-title">
            {tab === 'overview' && 'Dashboard'}
            {tab === 'volunteers' && 'Volunteer Management'}
            {tab === 'events' && 'Event Management'}
            {tab === 'attendance' && 'Attendance Tracking'}
            {tab === 'reports' && 'Reports & Analytics'}
          </span>
          {tab === 'events' && (
            <button className="btn btn-primary" onClick={() => setShowEventForm(true)}>+ New Event</button>
          )}
        </div>

        <div className="content">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div className="stats-grid">
                <div className="stat-card" style={{ background: 'linear-gradient(135deg,var(--admin),#40916C)', color: '#fff', border: 'none' }}>
                  <div className="stat-number">{reportData?.totalVolunteers || 0}</div>
                  <div className="stat-label" style={{ color: 'rgba(255,255,255,.8)' }}>Total Volunteers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{reportData?.activeVolunteers || 0}</div>
                  <div className="stat-label">Active Volunteers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{reportData?.totalEvents || 0}</div>
                  <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{reportData?.totalHours || 0}</div>
                  <div className="stat-label">Total Hours Logged</div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Top Volunteers</span>
                  <button className="btn btn-ghost" onClick={() => setTab('volunteers')}>View All</button>
                </div>
                <table><thead><tr><th>#</th><th>Volunteer</th><th>Area</th><th style={{ textAlign: 'right' }}>Hours</th></tr></thead>
                  <tbody>
                    {reportData?.topVolunteers.map((v, i) => (
                      <tr key={i}>
                        <td><span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</span></td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.78rem' }}>{v.name[0]}</div>
                          <span style={{ fontSize: '.86rem', fontWeight: 700 }}>{v.name}</span>
                        </div></td>
                        <td style={{ color: 'var(--text-muted)' }}>{v.area?.name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.totalHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel">
                <div className="panel-header"><span className="panel-title">Volunteers by Area</span></div>
                <div className="panel-body">
                  {reportData?.areas.map((area, i) => (
                    <div key={area.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.8rem' }}>{area.name[0]}</div>
                      <span style={{ fontSize: '.84rem', fontWeight: 700, minWidth: 120 }}>{area.name}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${reportData.totalVolunteers ? (area._count.volunteerProfiles / reportData.totalVolunteers) * 100 : 0}%`, background: avatarColors[i % 5], borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{area._count.volunteerProfiles}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VOLUNTEERS */}
          {tab === 'volunteers' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="input-wrap" style={{ flex: 1, minWidth: 200 }}>
                  <svg viewBox="0 0 24 24"><path d={ICONS.search} /></svg>
                  <input type="text" placeholder="Search volunteers..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
                <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid var(--border)', fontFamily: "'Nunito',sans-serif", fontSize: '.9rem', fontWeight: 700, background: 'var(--surface)', cursor: 'pointer' }}>
                  {areas.map(a => <option key={a}>{a}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid var(--border)', fontFamily: "'Nunito',sans-serif", fontSize: '.9rem', fontWeight: 700, background: 'var(--surface)', cursor: 'pointer' }}>
                  <option value="totalHours">Sort by Hours</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
              <div className="panel">
                <div className="panel-header"><span className="panel-title">All Volunteers ({filteredVolunteers.length})</span></div>
                <table><thead><tr><th>Volunteer</th><th>Area</th><th>Skills</th><th>Status</th><th style={{ textAlign: 'right' }}>Hours</th></tr></thead>
                  <tbody>
                    {filteredVolunteers.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No volunteers found.</td></tr>
                    ) : filteredVolunteers.map((v, i) => (
                      <tr key={v.id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.85rem' }}>{v.name[0]}</div>
                          <div><div style={{ fontSize: '.88rem', fontWeight: 700 }}>{v.name}</div><div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{v.user.email}</div></div>
                        </div></td>
                        <td style={{ color: 'var(--text-muted)' }}>{v.area?.name}</td>
                        <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {v.volunteerSkills?.slice(0, 2).map(vs => <span key={vs.skill.name} className="badge badge-green">{vs.skill.name}</span>)}
                          {v.volunteerSkills?.length > 2 && <span className="badge badge-amber">+{v.volunteerSkills.length - 2}</span>}
                        </div></td>
                        <td><span className={`badge ${v.isActive ? 'badge-green' : 'badge-red'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.totalHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS */}
          {tab === 'events' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              {showEventForm && (
                <div className="panel" style={{ marginBottom: 20 }}>
                  <div className="panel-header">
                    <span className="panel-title">Create New Event</span>
                    <button className="btn btn-ghost" onClick={() => setShowEventForm(false)}>Cancel</button>
                  </div>
                  <div className="panel-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-field">
                        <label>Event Title *</label>
                        <input type="text" placeholder="Tree Plantation Drive" value={newEvent.title}
                          onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                      </div>
                      <div className="form-field">
                        <label>Date *</label>
                        <input type="datetime-local" value={newEvent.date}
                          onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                      </div>
                      <div className="form-field">
                        <label>Location *</label>
                        <input type="text" placeholder="Mumbai, Maharashtra" value={newEvent.location}
                          onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} style={inputStyle} />
                      </div>
                      <div className="form-field">
                        <label>Description</label>
                        <input type="text" placeholder="Brief description..." value={newEvent.description}
                          onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={createEvent} style={{ marginTop: 16 }}>Create Event</button>
                  </div>
                </div>
              )}

              <div className="panel">
                <div className="panel-header"><span className="panel-title">All Events ({events.length})</span></div>
                <table><thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Volunteers</th><th>Assign</th><th style={{ textAlign: 'right' }}>Status</th></tr></thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No events yet. Create one!</td></tr>
                    ) : events.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 700 }}>{e.title}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(e.date).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{e.location}</td>
                        <td style={{ fontWeight: 700 }}>{e._count.eventAssignments}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select value={assignVolunteerId} onChange={x => setAssignVolunteerId(x.target.value)}
                              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: '.8rem', fontFamily: "'Nunito',sans-serif", fontWeight: 600, background: 'var(--surface)' }}>
                              <option value="">Select volunteer</option>
                              {volunteers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            <button onClick={() => assignVolunteerId && assignVolunteer(e.id, assignVolunteerId)}
                              style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--admin)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700 }}>
                              Assign
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge ${e.status === 'UPCOMING' ? 'badge-amber' : e.status === 'COMPLETED' ? 'badge-green' : e.status === 'ONGOING' ? 'badge-orange' : 'badge-red'}`}>{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ATTENDANCE */}
          {tab === 'attendance' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, marginBottom: 8 }}>Select Event</label>
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
                  style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid var(--border)', width: '100%', maxWidth: 400, fontFamily: "'Nunito',sans-serif", fontSize: '.9rem', fontWeight: 700, background: 'var(--surface)', cursor: 'pointer' }}>
                  {events.length === 0
                    ? <option>No events available</option>
                    : events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
                  }
                </select>
              </div>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                <div className="stat-card"><div className="stat-number">{attendance.length}</div><div className="stat-label">Total Marked</div></div>
                <div className="stat-card"><div className="stat-number" style={{ color: 'var(--secondary)' }}>{attendance.filter(a => a.status === 'PRESENT').length}</div><div className="stat-label">Present</div></div>
                <div className="stat-card"><div className="stat-number" style={{ color: '#c0392b' }}>{attendance.filter(a => a.status === 'ABSENT').length}</div><div className="stat-label">Absent</div></div>
              </div>
              <div className="panel">
                <div className="panel-header"><span className="panel-title">Attendance Roster</span></div>
                {attendance.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>??</div>
                    <div>No attendance records for this event yet.</div>
                    <div style={{ fontSize: '.82rem', marginTop: 8 }}>Assign volunteers to this event first, then mark attendance.</div>
                  </div>
                ) : (
                  <table><thead><tr><th>Volunteer</th><th>Status</th><th>Hours</th><th>Actions</th></tr></thead>
                    <tbody>
                      {attendance.map((a, i) => (
                        <tr key={a.id}>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.85rem' }}>{a.volunteerProfile.name[0]}</div>
                            <div><div style={{ fontSize: '.88rem', fontWeight: 700 }}>{a.volunteerProfile.name}</div><div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{a.volunteerProfile.user.email}</div></div>
                          </div></td>
                          <td><span className={`badge ${a.status === 'PRESENT' ? 'badge-green' : a.status === 'ABSENT' ? 'badge-red' : 'badge-amber'}`}>{a.status}</span></td>
                          <td style={{ fontWeight: 700 }}>{a.hoursLogged}h</td>
                          <td><div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => markAttendance(a.volunteerProfile.id, selectedEventId, 'PRESENT', 4)}
                              style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--secondary-pale)', color: 'var(--secondary)', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '.75rem' }}>Present</button>
                            <button onClick={() => markAttendance(a.volunteerProfile.id, selectedEventId, 'ABSENT', 0)}
                              style={{ padding: '6px 14px', borderRadius: 8, background: '#FEF2F2', color: '#991B1B', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '.75rem' }}>Absent</button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* REPORTS */}
          {tab === 'reports' && (
            <div style={{ animation: 'fadeIn .35s ease' }}>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-number">{reportData?.totalVolunteers || 0}</div><div className="stat-label">Total Volunteers</div></div>
                <div className="stat-card"><div className="stat-number">{reportData?.completedEvents || 0}</div><div className="stat-label">Completed Events</div></div>
                <div className="stat-card"><div className="stat-number">{reportData?.totalHours || 0}</div><div className="stat-label">Total Hours</div></div>
                <div className="stat-card"><div className="stat-number">{reportData?.attendance.present || 0}</div><div className="stat-label">Total Attendances</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="panel">
                  <div className="panel-header"><span className="panel-title">Top Volunteers by Hours</span></div>
                  <table><thead><tr><th>#</th><th>Name</th><th>Area</th><th style={{ textAlign: 'right' }}>Hours</th></tr></thead>
                    <tbody>
                      {reportData?.topVolunteers.map((v, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarColors[i % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '.72rem' }}>{v.name[0]}</div>
                            <span style={{ fontSize: '.86rem', fontWeight: 700 }}>{v.name}</span>
                          </div></td>
                          <td style={{ color: 'var(--text-muted)' }}>{v.area?.name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.totalHours}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="panel">
                  <div className="panel-header"><span className="panel-title">Attendance Summary</span></div>
                  <div className="panel-body">
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.85rem', fontWeight: 700 }}>
                        <span>Present</span><span style={{ color: 'var(--secondary)' }}>{reportData?.attendance.present || 0}</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${reportData?.attendance.present && reportData?.attendance.absent ? (reportData.attendance.present / (reportData.attendance.present + reportData.attendance.absent)) * 100 : 0}%`, background: 'var(--secondary)', borderRadius: 4 }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.85rem', fontWeight: 700 }}>
                        <span>Absent</span><span style={{ color: '#c0392b' }}>{reportData?.attendance.absent || 0}</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${reportData?.attendance.present && reportData?.attendance.absent ? (reportData.attendance.absent / (reportData.attendance.present + reportData.attendance.absent)) * 100 : 0}%`, background: '#c0392b', borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
