'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ICONS } from '@/lib/constants'

import { useRouter } from 'next/navigation'
import { useModal } from '@/components/ModalProvider'

type Event = {
  id: string
  title: string
  description: string | null
  location: string
  date: string
  category: string
  slots: number
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  _count: { eventAssignments: number }
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const { showAlert } = useModal()
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [form, setForm] = useState({ title: "", location: "", date: "", time: "", description: "", category: "Community", slots: 20, estimatedHours: 4 })

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    setLoading(true)
    try {
      const res = await fetch('/api/events')
      if (res.ok) setEvents(await res.json())
    } catch (error) { console.error(error) }
    setLoading(false)
  }

  function exportCSV() {
    if (events.length === 0) return
    const headers = ["Title", "Date", "Category", "Location", "Status", "Registered", "Slots"]
    const rows = events.map(e => [
      e.title,
      new Date(e.date).toLocaleDateString(),
      e.category,
      e.location,
      e.status,
      e._count.eventAssignments,
      e.slots
    ])
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "SevaConnect_Events_Report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function handleSave() {
    if (!form.title || !form.date || !form.location) return showAlert({ message: "Please fill in all required fields (Name, Date, Location)", type: "warning" })
    const eventDateTime = new Date(`${form.date}T${form.time || '00:00'}:00`).toISOString()
    
    const method = editingEvent ? 'PUT' : 'POST'
    const endpoint = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, date: eventDateTime })
      })

      if (res.ok) {
        setShowModal(false)
        setEditingEvent(null)
        showAlert({ message: editingEvent ? "Event updated successfully!" : "Event created successfully!", type: "success" })
        loadEvents()
      } else {
        const d = await res.json()
        showAlert({ message: d.error || "Error saving event", type: "danger" })
      }
    } catch (err) { 
      showAlert({ message: "Network error. Please try again.", type: "danger" }) 
    }
  }

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

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
        <Topbar 
          title="Event Management" 
          actions={
            <>
              <button className="btn btn-ghost" onClick={exportCSV}>📥 Export</button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--admin)' }}
                onClick={() => { setEditingEvent(null); setForm({ title: "", location: "", date: "", time: "", description: "", category: "Community", slots: 20, estimatedHours: 4 }); setShowModal(true); }}
              >
                + Create Event
              </button>
            </>
          } 
        />
        <div className="content">
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, fill: "var(--text-muted)" }}>
                <path d={ICONS.search} />
              </svg>
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search events…" 
                style={{ width: "100%", padding: "10px 14px 10px 38px", border: "2px solid var(--border)", borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: ".88rem", outline: "none" }} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>Loading events...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 80, textAlign: "center", color: "var(--text-muted)", gridColumn: "1/-1" }}>No events found.</div>
            ) : filtered.map((e) => {
              const dt = new Date(e.date)
              return (
                <div key={e.id} className="panel" style={{ cursor: "pointer", marginBottom: 0 }} onClick={() => router.push('/admin/events/' + e.id)}>
                  <div style={{ height: 110, background: 'var(--secondary-pale)', display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.05)" }}></div>
                    <span style={{ position: "relative", zIndex: 1 }}>🌿</span>
                  </div>
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 10 }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1rem", fontWeight: 700, lineHeight: 1.3, flex: 1 }}>{e.title}</div>
                      <span className={`badge ${e.status === 'COMPLETED' ? 'badge-green' : 'badge-amber'}`}>{e.status}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".8rem", color: "var(--text-muted)" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "currentColor" }}><path d={ICONS.calendar} /></svg>
                        {dt.toLocaleDateString()} · {dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".8rem", color: "var(--text-muted)" }}>
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "currentColor" }}><path d={ICONS.pin} /></svg>
                        {e.location}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: ".8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                          <span>{e._count.eventAssignments} registered</span>
                          <span>{e.slots} total slots</span>
                        </div>
                        <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                          <div style={{ height: "100%", width: `${Math.min((e._count.eventAssignments / Math.max(e.slots, 1)) * 100, 100)}%`, background: 'var(--secondary)', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editingEvent ? "Edit Event" : "Create New Event"}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-field">
              <label>Event Name</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.calendar} /></svg>
                <input type="text" placeholder="e.g. Community Clean-Up Drive" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-field">
                <label>Date</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><path d={ICONS.calendar} /></svg>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Time</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><path d={ICONS.clock} /></svg>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-field">
                <label>Category</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><path d={ICONS.edit} /></svg>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {["Education", "Environment", "Healthcare", "Animal Welfare", "Elderly Care", "Community", "Children"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>No. of Volunteers</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><path d={ICONS.people} /></svg>
                  <input type="number" min={1} value={form.slots} onChange={e => setForm({ ...form, slots: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-field">
                <label>Estimated Hours</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24"><path d={ICONS.clock} /></svg>
                  <input type="number" min={1} value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="form-field">
              <label>Location</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.pin} /></svg>
                <input type="text" placeholder="Venue name or address" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label>Description</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" style={{ top: 16, transform: "none" }}><path d={ICONS.edit} /></svg>
                <textarea placeholder="Describe the event…" style={{ padding: "12px 14px 12px 42px", minHeight: 72, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: 'var(--admin)' }} onClick={handleSave}>
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
