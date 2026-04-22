'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import { ICONS, avatarColors } from "@/lib/constants"
import { useParams } from "next/navigation"
import { useModal } from "@/components/ModalProvider"

export default function EventDetails() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { showAlert, showConfirm } = useModal()

  const [showAddVolModal, setShowAddVolModal] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [allVolunteers, setAllVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvitee, setSelectedInvitee] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", location: "", slots: 0, category: "Community", description: "", date: "", estimatedHours: 4 })
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (eventId) loadData()
  }, [eventId])

  async function loadData() {
    setLoading(true)
    setErrorMsg("")
    try {
      const res = await fetch(`/api/events/${eventId}`)
      if (res.ok) {
        const eData = await res.json()
        setEvent(eData)
        setEditForm({
          title: eData.title,
          location: eData.location,
          slots: eData.slots || 20,
          category: eData.category || "Community",
          description: eData.description || "",
          date: eData.date,
          estimatedHours: eData.estimatedHours || 4
        })

        // Map eventAssignments to volunteer list
        const mappedVols = (eData.eventAssignments || []).map((a: any) => ({
          id: a.volunteerProfile.id,
          name: a.volunteerProfile.name,
          email: a.volunteerProfile.user?.email || '',
          assignmentId: a.id,
          status: a.status // ASSIGNED = Pending, CONFIRMED = Accepted, WITHDRAWN = Rejected
        }))
        setVolunteers(mappedVols)
      } else {
        setErrorMsg(`Failed to load: ${res.status} ${res.statusText}`)
      }

      const vRes = await fetch('/api/volunteers')
      if (vRes.ok) {
        const vData = await vRes.json()
        setAllVolunteers(vData.filter((v: any) => v.isActive))
      }
    } catch (e: any) {
      setErrorMsg("Error: " + e.message)
    }

    setLoading(false)
  }

  async function assignVolunteer() {
    if (!selectedInvitee) return showAlert({ message: "Select a volunteer first", type: "warning" })
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, volunteerProfileId: selectedInvitee })
      })
      if (res.ok) {
        showAlert({ message: "Invite sent to the volunteer!", type: "success" })
        setShowAddVolModal(false)
        setSelectedInvitee("")
        loadData()
      } else {
        const data = await res.json()
        showAlert({ message: data.error || "Failed to assign volunteer", type: "danger", title: "Error" })
      }
    } catch (e: any) {
      showAlert({ message: e.message, type: "danger", title: "Error" })
    }
  }

  async function removeVolunteer(assignmentId: string) {
    const ok = await showConfirm({ 
      message: "Are you sure you want to remove this volunteer from the event?", 
      type: "danger",
      confirmText: "Remove"
    })
    if (!ok) return
    try {
      // We'll withdraw the assignment
      const res = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, action: 'REJECT' })
      })
      if (res.ok) {
        showAlert({ message: "Volunteer removed from event.", type: "success" })
        loadData()
      }
    } catch {}
  }

  async function handleEditSubmit(e: React.FormEvent) {
    if (e) e.preventDefault()
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setShowEditModal(false)
        showAlert({ message: "Event updated successfully!", type: "success" })
        loadData()
      } else {
        showAlert({ message: "Error updating event", type: "danger" })
      }
    } catch (err: any) {
      showAlert({ message: "Error updating: " + err.message, type: "danger" })
    }
  }

  async function deleteEvent() {
    const ok = await showConfirm({
      message: "Are you sure you want to permanently delete this event? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete Event"
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/events')
      } else {
        showAlert({ message: "Error deleting event.", type: "danger" })
      }
    } catch (err: any) {
      showAlert({ message: "Error deleting: " + err.message, type: "danger" })
    }
  }

  async function markCompleted() {
    const ok = await showConfirm({
      message: "Mark this event as COMPLETED? This will close volunteer assignments.",
      type: "confirm",
      confirmText: "Mark Completed"
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, status: 'COMPLETED' })
      })
      if (res.ok) {
        showAlert({ message: "Event marked as COMPLETED!", type: "success" })
        loadData()
      } else {
        showAlert({ message: "Error updating status", type: "danger" })
      }
    } catch (err: any) {
      showAlert({ message: "Error: " + err.message, type: "danger" })
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'ASSIGNED': return { label: 'Pending', cls: 'badge-amber' }
      case 'CONFIRMED': return { label: 'Accepted', cls: 'badge-green' }
      case 'WITHDRAWN': return { label: 'Rejected', cls: 'badge-gray' }
      default: return { label: status, cls: 'badge-amber' }
    }
  }

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="ADMIN" userName="Super Admin" userRoleLabel="Administrator" avatarLetter="A" accentColor="var(--admin)" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading event details...</div>
    </div>
  )

  if (errorMsg || !event) return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="ADMIN" userName="Super Admin" userRoleLabel="Administrator" avatarLetter="A" accentColor="var(--admin)" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: 'red' }}>
        {errorMsg || "Event not found."}
      </div>
    </div>
  )

  const dt = event.date ? new Date(event.date) : new Date()
  const confirmedCount = volunteers.filter(v => v.status === 'CONFIRMED').length
  const pct = Math.round((confirmedCount / (event.slots || 1)) * 100)
  const eIcon = event.category === "Environment" ? "🌿" : event.category === "Education" ? "📚" : event.category === "Food & Nutrition" ? "🍱" : event.category === "Healthcare" ? "🏥" : "💡"

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="ADMIN" userName="Super Admin" userRoleLabel="Administrator" avatarLetter="A" accentColor="var(--admin)" />
      
      <div className="main-wrap">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.push("/admin/events")} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: "currentColor" }}><path d={ICONS.back} /></svg>
            </button>
            <span className="topbar-title">Event Details</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {event.status !== 'COMPLETED' && (
              <button className="btn btn-ghost" onClick={markCompleted} style={{ background: "var(--secondary-pale)", color: "var(--secondary)", border: "1px solid var(--secondary)", fontWeight: 700 }}>✅ Mark Completed</button>
            )}
            <button className="btn btn-ghost" onClick={() => setShowEditModal(true)}>✏️ Edit Event</button>
            <button className="btn" onClick={deleteEvent} style={{ color: "#c0392b", background: "#fde8e8", border: "1px solid #f5c6c6", fontWeight: 700 }}>Delete</button>
          </div>
        </div>

        <div className="content">
          {/* Hero Banner */}
          <div style={{ background: "linear-gradient(135deg,var(--admin),#2D6A4F,#40916C)", borderRadius: "var(--radius)", padding: 36, marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -40, top: -40, fontSize: "8rem", opacity: .1 }}>{eIcon}</div>
            <div>
              <div style={{ display: "inline-flex", padding: "5px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, background: "rgba(255,255,255,.2)", color: "#fff", marginBottom: 14 }}>{eIcon} {event.category}</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>{event.title}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {[["calendar", `${dt.toLocaleDateString()} · ${dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`], ["pin", event.location], ["clock", (event.slots || 20) + " Slots"]].map(([ic, t]) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".85rem", color: "rgba(255,255,255,.8)" }}>
                    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, fill: "currentColor" }}><path d={ICONS[ic as keyof typeof ICONS]} /></svg>{t}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, position: "relative", zIndex: 1 }}>
              <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 14, padding: "16px 20px", textAlign: "center", backdropFilter: "blur(10px)" }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{confirmedCount}/{event.slots || 20}</div>
                <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.7)", fontWeight: 600 }}>CONFIRMED</div>
                <div style={{ height: 8, background: "rgba(255,255,255,.2)", borderRadius: 4, overflow: "hidden", width: 120, margin: "8px auto 0" }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "#EDB84A", borderRadius: 4 }}></div>
                </div>
              </div>
              <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 20, fontSize: ".71rem", fontWeight: 700, background: "rgba(200,82,42,.3)", color: "#fff" }}>{event.status}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div>
              {/* About */}
              <div className="panel">
                <div className="panel-header"><span className="panel-title">About this Event</span></div>
                <div className="panel-body">
                  <p style={{ fontSize: ".9rem", lineHeight: 1.7, marginBottom: 20, color: "var(--text)" }}>{event.description || "No description available."}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[["Organiser", "SevaConnect Admin"], ["Category", event.category || "Community"], ["Location", event.location], ["Capacity", (event.slots || 20) + " volunteers"]].map(([l, v]) => (
                      <div key={l} style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--text-muted)", marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: ".9rem", fontWeight: 700 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assigned Volunteers */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Assigned Volunteers ({volunteers.length})</span>
                  {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && (
                    <button onClick={() => setShowAddVolModal(true)} className="btn btn-primary" style={{ fontSize: ".8rem", padding: "7px 14px", background: "var(--admin)" }}>+ Add Volunteer</button>
                  )}
                </div>
                <table>
                  <thead><tr><th>Volunteer</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {volunteers.length === 0 ? (
                       <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No volunteers assigned yet.</td></tr>
                    ) : volunteers.map((v, i) => {
                      const badge = getStatusBadge(v.status)
                      return (
                        <tr key={v.assignmentId}>
                          <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatarColors[i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: ".8rem" }}>{v.name?.[0] || "?"}</div>
                            <div><div style={{ fontSize: ".86rem", fontWeight: 700 }}>{v.name}</div><div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{v.email}</div></div>
                          </div></td>
                          <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                          <td>
                            {v.status !== 'WITHDRAWN' && (
                              <button onClick={() => removeVolunteer(v.assignmentId)} style={{ padding: "5px 10px", borderRadius: 6, background: "#fde8e8", color: "#c0392b", fontFamily: "'Nunito',sans-serif", fontSize: ".75rem", fontWeight: 700, border: "none", cursor: "pointer" }}>Remove</button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right sidebar */}
            <div>
              <div className="panel">
                <div className="panel-header"><span className="panel-title">Live Impact Stats</span></div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      ["Event Type", event.category || "Community", "var(--bg)", "var(--border)"],
                      ["Total Slots", event.slots || 20, "var(--secondary-pale)", "transparent"],
                      ["Confirmed", confirmedCount, "var(--accent-pale)", "transparent"],
                      ["Pending", volunteers.filter(v => v.status === 'ASSIGNED').length, "#fef3cd", "transparent"],
                      ["Rejected", volunteers.filter(v => v.status === 'WITHDRAWN').length, "#fde8e8", "transparent"]
                    ].map(([l, v, bg, border]) => (
                      <div key={l as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: bg as string, borderRadius: 10, border: `1px solid ${border as string}` }}>
                        <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{l}</span>
                        <span style={{ fontFamily: "'Fraunces',serif", fontSize: "1.3rem", fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Volunteer Modal */}
      {showAddVolModal && (
        <div className="modal-overlay" onClick={() => setShowAddVolModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Send Invite to Volunteer</span>
              <button className="modal-close" onClick={() => setShowAddVolModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: ".85rem", color: "var(--text-muted)", marginBottom: 16 }}>
              The selected volunteer will receive an invite. They can accept or reject it from their dashboard.
            </p>
            <div className="form-field">
              <label>Select Volunteer</label>
              <select value={selectedInvitee} onChange={e => setSelectedInvitee(e.target.value)} style={{ padding: "12px 14px", width: "100%", border: "2px solid var(--border)", borderRadius: "12px", background: "var(--surface)", fontFamily: "'Nunito',sans-serif", fontSize: ".85rem" }}>
                <option value="">Select a volunteer...</option>
                {allVolunteers
                  .filter(v => !volunteers.some(av => av.id === v.id))
                  .map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name} — {v.area?.name}</option>
                  ))
                }
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setShowAddVolModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: "var(--admin)" }} onClick={assignVolunteer}>Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">Edit Event</span>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: "grid", gap: 12 }}>
                <div className="form-field">
                  <label>Event Title</label>
                  <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }} required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-field">
                    <label>Category</label>
                    <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }}>
                      <option>Environment</option><option>Education</option><option>Food & Nutrition</option><option>Healthcare</option><option>Community</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Total Slots</label>
                    <input type="number" value={editForm.slots} onChange={e => setEditForm({...editForm, slots: e.target.value === '' ? 0 : parseInt(e.target.value)})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }} required />
                  </div>
                  <div className="form-field">
                    <label>Est. Hours</label>
                    <input type="number" value={editForm.estimatedHours} onChange={e => setEditForm({...editForm, estimatedHours: e.target.value === '' ? '' as any : parseInt(e.target.value)})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }} required />
                  </div>
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }} required />
                </div>
                <div className="form-field">
                  <label>Date & Time</label>
                  <input type="datetime-local" value={editForm.date ? new Date(new Date(editForm.date).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ""} onChange={e => setEditForm({...editForm, date: e.target.value})} style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }} required />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ minHeight: 80, width: "100%", padding: 12, borderRadius: 10, border: "2px solid var(--border)", outline: "none", fontSize: "0.85rem" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: "var(--admin)" }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
