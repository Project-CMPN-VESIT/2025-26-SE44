'use client'
import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import { ICONS, avatarColors } from "@/lib/constants"

type Volunteer = {
  id: string
  name: string
  email: string
  status: string
  isAvailable: boolean
  skills: string[]
  area: string
  joined: string
  hours: number
  events: number
  hasActiveAssignment: boolean
  idx?: number
}

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [dbEvents, setDbEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [modalVol, setModalVol] = useState<Volunteer | null>(null)
  const [selectedEvent, setSelectedEvent] = useState("")

  useEffect(() => {
    loadVolunteers()
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const res = await fetch('/api/events')
      if (res.ok) setDbEvents(await res.json())
    } catch {}
  }

  async function loadVolunteers() {
    setLoading(true)
    let finalData: any[] = []
    try {
      const res = await fetch('/api/volunteers')
      if (res.ok) finalData = await res.json()
    } catch (error) {
      console.error("Error fetching volunteers:", error)
    }
    
    if (finalData) {
      const mapped = finalData
        .filter((v: any) => v.approvalStatus === 'APPROVED')
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          email: v.user.email,
          status: v.isActive ? 'Active' : 'Inactive',
          isAvailable: v.isActive,
          skills: v.volunteerSkills ? v.volunteerSkills.map((s: any) => s.skill.name) : [],
          area: v.area?.name || 'N/A',
          joined: v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown',
          hours: v.totalHours || 0,
          events: v.eventAssignments?.length || 0,
          hasActiveAssignment: (v.eventAssignments?.length || 0) > 0
        }))
        .sort((a: Volunteer, b: Volunteer) => a.name.localeCompare(b.name))
      setVolunteers(mapped)
    }
    setLoading(false)
  }

  async function deleteVolunteer(id: string) {
    if (!confirm("Are you sure you want to remove this volunteer? This action cannot be undone.")) return
    setVolunteers(prev => prev.filter(v => v.id !== id))
    alert("Volunteer removed successfully!")
  }

  async function assignToEvent() {
    if (!selectedEvent || !modalVol) return alert("Please select an event first")
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent, volunteerProfileId: modalVol.id })
      })
      if (res.ok) {
        alert(`Invite sent to ${modalVol.name}!`)
        setModalVol(null)
        setSelectedEvent("")
        loadVolunteers()
      } else {
        const data = await res.json()
        alert("Error: " + (data.error || "Failed to assign"))
      }
    } catch (e: any) {
      alert("Error: " + e.message)
    }
  }

  // Collect all unique skills and areas for filter dropdowns
  const allSkills = [...new Set(volunteers.flatMap(v => v.skills))].sort()
  const allAreas = [...new Set(volunteers.map(v => v.area))].sort()

  const filtered = volunteers.filter(v => {
    const q = search.toLowerCase()
    const matchQ = v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.skills.some(s => s.toLowerCase().includes(q))
    const matchS = !statusFilter || (statusFilter === 'Available' ? v.isAvailable : !v.isAvailable)
    const matchSkill = !skillFilter || v.skills.includes(skillFilter)
    const matchLoc = !locationFilter || v.area === locationFilter
    return matchQ && matchS && matchSkill && matchLoc
  })

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar 
        role="ADMIN" 
        userName="Super Admin" 
        userRoleLabel="Administrator" 
        avatarLetter="A" 
        accentColor="var(--admin)" 
      />
      <div className="main-wrap">
        <Topbar title="Volunteer Management" />
        <div className="content">
          <div style={{ paddingBottom: 20, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <button className="btn btn-ghost">📥 Export</button>
          </div>
          
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              ["👥", "#e4f2eb", volunteers.length, "Total Approved"], 
              ["✅", "var(--secondary-pale)", volunteers.filter(v => v.isAvailable).length, "Available"], 
              ["🔧", "var(--accent-pale)", volunteers.filter(v => !v.isAvailable).length, "Busy"]
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
          
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, fill: "var(--text-muted)" }}><path d={ICONS.search} /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or skill…" style={{ width: "100%", padding: "10px 14px 10px 38px", border: "2px solid var(--border)", borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: ".88rem", color: "var(--text)", outline: "none" }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "10px 14px", border: "2px solid var(--border)", borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: ".85rem", outline: "none" }}>
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
            </select>
            <div style={{ position: "relative" }}>
              <input list="skillsList" placeholder="All Skills" value={skillFilter} onChange={e => setSkillFilter(e.target.value)} onFocus={e => e.target.value = ''} style={{ padding: "10px 14px", border: "2px solid var(--border)", borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: ".85rem", outline: "none", width: 140 }} />
              <datalist id="skillsList">
                <option value="">All Skills</option>
                {allSkills.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div style={{ position: "relative" }}>
              <input list="locationsList" placeholder="All Locations" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} onFocus={e => e.target.value = ''} style={{ padding: "10px 14px", border: "2px solid var(--border)", borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: ".85rem", outline: "none", width: 140 }} />
              <datalist id="locationsList">
                <option value="">All Locations</option>
                {allAreas.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>
          </div>
          
          {/* Table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead><tr><th>Volunteer</th><th>Location</th><th>Status</th><th>Hours</th><th>Events</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                   {loading ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 30 }}>Loading volunteers...</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign: "center", padding: 30 }}>No volunteers found.</td></tr> : filtered.map((v, i) => (
                    <tr key={v.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColors[i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: ".85rem" }}>{v.name[0]}</div>
                        <div><div style={{ fontSize: ".88rem", fontWeight: 700 }}>{v.name}</div><div style={{ fontSize: ".74rem", color: "var(--text-muted)" }}>{v.email}</div></div>
                      </div></td>
                      <td style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>{v.area}</td>
                      <td><span className={`badge ${v.isAvailable ? 'badge-green' : 'badge-amber'}`}>{v.isAvailable ? 'Available' : 'Busy'}</span></td>
                      <td style={{ fontWeight: 700, fontSize: ".88rem" }}>{v.hours} hrs</td>
                      <td style={{ fontSize: ".88rem" }}>{v.events}</td>
                      <td style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{v.joined}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setModalVol({ ...v, idx: i })} style={{ padding: "5px 8px", borderRadius: 6, background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)", fontFamily: "'Nunito',sans-serif", fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>View</button>
                          <button onClick={() => deleteVolunteer(v.id)} style={{ padding: "5px 8px", borderRadius: 6, background: "#fde8e8", border: "1px solid #f5c6c6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: "#c0392b" }}><path d={ICONS.trash} /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>Showing {filtered.length} of {volunteers.length} volunteers</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Modal */}
      {modalVol && (
        <div className="modal-overlay" onClick={() => setModalVol(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modalVol.name}</span>
              <button className="modal-close" onClick={() => setModalVol(null)}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--bg)", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: avatarColors[(modalVol.idx || 0) % 5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "1.4rem" }}>{modalVol.name[0]}</div>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.2rem", fontWeight: 700 }}>{modalVol.name}</div>
                <div style={{ fontSize: ".83rem", color: "var(--text-muted)", marginTop: 3 }}>{modalVol.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <span className={`badge ${modalVol.hasActiveAssignment ? 'badge-amber' : 'badge-green'}`}>{modalVol.hasActiveAssignment ? 'Busy' : 'Available'}</span>
                  <span className="badge badge-gray">{modalVol.area}</span>
                </div>
              </div>
            </div>

            {/* Skills section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--text-muted)", marginBottom: 8 }}>Skills & Expertise</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {modalVol.skills && modalVol.skills.length > 0 ? modalVol.skills.map(s => (
                  <span key={s} style={{ background: "var(--secondary-pale)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", fontSize: ".8rem", fontWeight: 600, color: "var(--admin)" }}>{s}</span>
                )) : (
                  <span style={{ fontSize: ".8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No skills listed</span>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["Joined", modalVol.joined], ["Hours Logged", `${modalVol.hours} hrs`], ["Events", `${modalVol.events}`]].map(([l, v]) => (
                <div key={l as string} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--text-muted)", marginBottom: 3 }}>{l as string}</div>
                  <div style={{ fontSize: ".88rem", fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Assign to event - real events from DB */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--text-muted)", marginBottom: 8 }}>Assign to Event</div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <select 
                    value={selectedEvent} 
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid var(--border)", fontFamily: "'Nunito',sans-serif", fontSize: "0.85rem", fontWeight: 600, appearance: "none", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">Select Event to Assign...</option>
                    {dbEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                  <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }}>▼</div>
                </div>
                <button className="btn btn-primary" style={{ background: 'var(--admin)' }} onClick={assignToEvent}>
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
