'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ICONS } from '@/lib/constants'

type VolunteerProfile = {
  id: string
  name: string
  phone: string
  totalHours: number
  isActive: boolean
  createdAt: string
  area: { name: string }
}

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
  }
}

export default function VolunteerDashboard() {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const profRes = await fetch('/api/volunteers/me')
      if (profRes.ok) setProfile(await profRes.json())

      const eventsRes = await fetch('/api/events')
      if (eventsRes.ok) setAssignments(await eventsRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function toggleStatus() {
    if (!profile) return
    const newStatus = !profile.isActive
    try {
      const res = await fetch('/api/volunteers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })
      if (res.ok) {
        setProfile(prev => prev ? { ...prev, isActive: newStatus } : prev)
      }
    } catch (e) { console.error(e) }
  }

  const name = profile?.name || "Volunteer"
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2)
  const areaName = profile?.area?.name || "Bharat"
  const statusLabel = profile?.isActive ? "Available" : "Busy"

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading Dashboard...</div>
    </div>
  )

  return (
    <div style={{ display: "flex" }}>
      <Sidebar 
        role="VOLUNTEER" 
        userName={name} 
        userRoleLabel="Volunteer" 
        avatarLetter={initials} 
        accentColor="var(--primary)" 
      />
      
      <div className="main-wrap">
        <Topbar title="My Dashboard" />
        
        <div className="content">
          {/* Header Banner */}
          <div style={{ 
            background: "linear-gradient(135deg,var(--primary) 0%,#B04420 50%,var(--accent) 100%)", 
            borderRadius: "var(--radius)", 
            padding: "28px 32px", 
            marginBottom: 28, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            position: "relative", 
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(200,82,42,0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: "50%", 
                background: "rgba(255,255,255,.25)", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontFamily: "'Fraunces',serif", fontSize: "1.8rem", 
                fontWeight: 700, color: "#fff", flexShrink: 0, 
                border: "3px solid rgba(255,255,255,.4)" 
              }}>{initials}</div>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>{name}</div>
                <div style={{ fontSize: ".85rem", color: "rgba(255,255,255,.75)", marginBottom: 12 }}>📍 {areaName}</div>
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    [profile?.totalHours || 0, "HOURS"], 
                    [assignments.length, "EVENTS"]
                  ].map(([n, l]) => (
                    <div key={l as string} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.3rem", fontWeight: 700, color: "#fff" }}>{n}</div>
                      <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.65)", fontWeight: 600 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Status Toggle - syncs with DB */}
            <div style={{ 
              background: "rgba(255,255,255,0.15)", 
              padding: "12px 18px", 
              borderRadius: 16, 
              backdropFilter: "blur(10px)", 
              border: "1px solid rgba(255,255,255,0.2)", 
              display: "flex", flexDirection: "column", 
              alignItems: "center", gap: 8 
            }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: 0.5 }}>STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusLabel === "Available" ? "#9ef01a" : "rgba(255,255,255,0.5)" }}>Available</span>
                <div 
                  onClick={toggleStatus}
                  style={{ width: 44, height: 22, background: statusLabel === "Available" ? "#38b000" : "#d00000", borderRadius: 20, position: "relative", cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  <div style={{ 
                    width: 18, height: 18, background: "#fff", 
                    borderRadius: "50%", position: "absolute", top: 2, 
                    left: statusLabel === "Available" ? 24 : 2, 
                    transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)" 
                  }}></div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusLabel === "Busy" ? "#ff4d4d" : "rgba(255,255,255,0.5)" }}>Busy</span>
              </div>
            </div>
          </div>

          {/* Key Metrics - Updated: hours completed, events attended, area */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              ["⏱️", "var(--accent-pale)", `${profile?.totalHours || 0}h`, "Hours Completed"], 
              ["📅", "var(--secondary-pale)", `${assignments.filter(a => a.status === 'CONFIRMED').length}`, "Events Confirmed"], 
              ["📍", "var(--primary-pale)", areaName, "My Area"]
            ].map(([ic, bg, n, l]) => (
              <div key={l} className="stat-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{ic}</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.4rem", fontWeight: 700 }}>{n}</div>
                  <div style={{ fontSize: ".78rem", color: "var(--text-muted)", fontWeight: 600 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">My Registered Events</span>
                <span className="badge badge-amber">{assignments.length} assigned</span>
              </div>
              <div className="panel-body" style={{ padding: "10px 22px" }}>
                {assignments.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>You haven't been assigned to any events yet.</div>
                ) : assignments.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: i < assignments.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🌿</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".88rem", fontWeight: 700 }}>{a.event.title}</div>
                      <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(a.event.date).toLocaleDateString()} · {a.event.location}
                      </div>
                    </div>
                    <span className={`badge ${a.status === 'CONFIRMED' ? 'badge-green' : a.status === 'ASSIGNED' ? 'badge-amber' : 'badge-gray'}`}>
                      {a.status === 'CONFIRMED' ? 'Accepted' : a.status === 'ASSIGNED' ? 'Pending' : 'Declined'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}