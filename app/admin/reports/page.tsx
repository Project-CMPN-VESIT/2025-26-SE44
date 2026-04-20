'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { ICONS, avatarColors } from '@/lib/constants'

type ReportData = {
  totalVolunteers: number
  activeVolunteers: number
  totalEvents: number
  completedEvents: number
  upcomingEvents: number
  totalHours: number
  topVolunteers: { id: string; name: string; totalHours: number; area: { name: string } }[]
  areas: { name: string; _count: { volunteerProfiles: number } }[]
  attendance: { present: number; absent: number }
}

export default function Reports() {
  const [range, setRange] = useState("30d")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => { loadReportData() }, [range])

  async function loadReportData() {
    setLoading(true)
    try {
      const res = await fetch('/api/reports')
      if (res.ok) setReportData(await res.json())
      
      const resEvents = await fetch('/api/events')
      if (resEvents.ok) setAllEvents(await resEvents.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  let wkHrs = [0, 0, 0, 0]
  if (reportData?.weeklyAttendance) {
    const now = new Date().getTime()
    reportData.weeklyAttendance.forEach((a: any) => {
      const diffDays = Math.floor((now - new Date(a.markedAt).getTime()) / (1000 * 3600 * 24))
      const weekIdx = 3 - Math.floor(diffDays / 7)
      if (weekIdx >= 0 && weekIdx <= 3) {
        wkHrs[weekIdx] += a.hoursLogged || 0
      }
    })
  }

  const chartData = {
    weeks: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
    wkHrs: wkHrs
  }

  // Pie chart calculation for Events by Category
  const catColors: Record<string, string> = { "Environment": "#5E9E7A", "Community": "#3498db", "Healthcare": "#C8522A", "Education": "#EDB84A", "Animal Welfare": "#9b59b6", "Elderly Care": "#e67e22", "Children": "#e84393" }
  const totalEventsCount = reportData?.eventsByCategory?.reduce((acc: number, curr: any) => acc + curr._count._all, 0) || 1
  let offset = 0
  const arcs = (reportData?.eventsByCategory || []).map((cat: any) => {
    const val = cat._count._all
    const dash = (val / totalEventsCount) * 251.3
    const gap = 251.3 - dash
    const arc = { label: cat.category, color: catColors[cat.category] || "#2D6A4F", val, dash, gap, offset: -offset }
    offset += dash
    return arc
  })

  const maxH = Math.max(...chartData.wkHrs, 1)

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
          title="Reports & Analytics" 
          actions={
            <>
              <button className="btn btn-ghost">📥 Export PDF</button>
              <button className="btn btn-ghost">📊 Export CSV</button>
            </>
          } 
        />
        <div className="content">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "var(--bg)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
              {[["7d", "7 Days"], ["30d", "30 Days"], ["3m", "3 Months"], ["yr", "This Year"]].map(([v, l]) => (
                <button 
                  key={v} 
                  onClick={() => setRange(v)} 
                  style={{ 
                    padding: "7px 16px", border: "none", 
                    background: range === v ? "var(--surface)" : "transparent", 
                    borderRadius: 6, cursor: "pointer", 
                    fontFamily: "'Nunito',sans-serif", fontSize: ".83rem", 
                    fontWeight: 600, color: range === v ? "var(--text)" : "var(--text-muted)", 
                    boxShadow: range === v ? "0 1px 3px rgba(45,36,32,.1)" : "none" 
                  }}
                >{l}</button>
              ))}
            </div>
            <span style={{ fontSize: ".8rem", fontWeight: 600, background: "var(--secondary-pale)", color: "#2d7a50", padding: "6px 12px", borderRadius: 6, fontFamily: "'Nunito',sans-serif" }}>
              📅 Showing: Last {range === "30d" ? "30 Days" : range === "7d" ? "7 Days" : range === "3m" ? "3 Months" : "Year"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              ["🟢", reportData?.activeVolunteers || 0, "Active Volunteers", "Current Status", true], 
              ["⏱", reportData?.totalHours || 0, "Impact Hours", "Total Logged", true], 
              ["📅", reportData?.completedEvents || 0, "Events Completed", "Verified", true]
            ].map(([ic, n, l, c, up]) => (
              <div key={l as string} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 22, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -10, top: -10, fontSize: "3.5rem", opacity: .07 }}>{ic}</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "2rem", fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{n}</div>
                <div style={{ fontSize: ".78rem", color: "var(--text-muted)", fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, marginTop: 8, color: up ? "var(--secondary)" : "var(--primary)" }}>{c}</div>
              </div>
            ))}
          </div>

          {loading ? (
             <div style={{ padding: 100, textAlign: "center", color: "var(--text-muted)" }}>Generating reports...</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                <div className="panel">
                  <div className="panel-header"><span className="panel-title">Volunteer Hours Trend</span></div>
                  <div className="panel-body">
                    <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 10 }}>
                      {chartData.wkHrs.map((h, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: ".68rem", fontWeight: 700, color: "var(--text-muted)" }}>{h}h</span>
                          <div style={{ 
                            width: "100%", 
                            height: (h / maxH) * 160, 
                            background: "var(--admin)", 
                            borderRadius: "6px 6px 0 0", 
                            minHeight: 8 
                          }}></div>
                          <span style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>{chartData.weeks[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-header"><span className="panel-title">Events by Category</span></div>
                  <div className="panel-body">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      <svg width="120" height="120" viewBox="0 0 110 110">
                        <circle cx="55" cy="55" r="40" fill="none" stroke="var(--border)" strokeWidth="20" />
                        {arcs.map((arc: any, i: number) => (
                          <circle 
                            key={i} cx="55" cy="55" r="40" fill="none" 
                            stroke={arc.color} strokeWidth="20" 
                            strokeDasharray={`${arc.dash} ${arc.gap}`} 
                            strokeDashoffset={arc.offset} 
                            transform="rotate(-90 55 55)" 
                            style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
                            onClick={() => setSelectedCategory(selectedCategory === arc.label ? null : arc.label)}
                          />
                        ))}
                        <text x="55" y="58" textAnchor="middle" fontFamily="'Fraunces',serif" fontSize="16" fontWeight="700" fill="var(--text)">
                          {reportData?.totalEvents || 0}
                        </text>
                      </svg>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, width: "100%", fontSize: ".75rem" }}>
                        {arcs.map((arc: any) => (
                          <div 
                            key={arc.label} 
                            style={{ 
                              display: "flex", alignItems: "center", gap: 6, cursor: "pointer", 
                              opacity: selectedCategory && selectedCategory !== arc.label ? 0.5 : 1
                            }}
                            onClick={() => setSelectedCategory(selectedCategory === arc.label ? null : arc.label)}
                          >
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: arc.color }}></div>
                            <span style={{ color: "var(--text)", fontWeight: selectedCategory === arc.label ? 700 : 400 }}>{arc.label} ({arc.val})</span>
                          </div>
                        ))}
                        {arcs.length === 0 && <span style={{color: "var(--text-muted)"}}>No event data</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="panel">
                  <div className="panel-header"><span className="panel-title">Top Impact Volunteers</span></div>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Volunteer</th>
                        <th>Hours</th>
                        <th>Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.topVolunteers.map((v, i) => (
                        <tr key={v.id}>
                          <td><span style={{ fontFamily: "'Fraunces',serif", fontSize: ".95rem", fontWeight: 700, color: "var(--text-muted)" }}>{i + 1}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarColors[i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: ".78rem" }}>{v.name[0]}</div>
                              <span style={{ fontSize: ".86rem", fontWeight: 700 }}>{v.name}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, fontSize: ".88rem" }}>{v.totalHours}</td>
                          <td style={{ fontSize: ".86rem", color: "var(--text-muted)" }}>{v.area.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="panel">
                  {selectedCategory ? (
                    <>
                      <div className="panel-header">
                        <span className="panel-title" style={{ color: catColors[selectedCategory] }}>{selectedCategory} Events</span>
                        <button onClick={() => setSelectedCategory(null)} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: ".8rem" }}>Clear</button>
                      </div>
                      <div className="panel-body">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {allEvents.filter(e => e.category === selectedCategory).length === 0 ? (
                            <div style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>No events found.</div>
                          ) : allEvents.filter(e => e.category === selectedCategory).map((e: any) => (
                            <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                              <div style={{ fontWeight: 700, fontSize: ".85rem" }}>{e.title}</div>
                              <div style={{ fontSize: ".72rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                                <span>{new Date(e.date).toLocaleDateString()}</span>
                                <span className={`badge ${e.status === 'COMPLETED' ? 'badge-green' : 'badge-amber'}`}>{e.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="panel-header"><span className="panel-title">Volunteers by Area</span></div>
                      <div className="panel-body">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {reportData?.areas.slice(0, 5).map((area: any, i: number) => {
                            const pct = (area._count.volunteerProfiles / (reportData?.totalVolunteers || 1)) * 100
                            return (
                              <div key={area.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem" }}>
                                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: avatarColors[i % 5], flexShrink: 0 }}></div>
                                  <span style={{ color: "var(--text)", fontWeight: 600 }}>{area.name}</span>
                                  <span style={{ fontWeight: 700, marginLeft: "auto", color: "var(--text-muted)" }}>{area._count.volunteerProfiles} vols</span>
                                </div>
                                <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginLeft: 18 }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: avatarColors[i % 5], borderRadius: 3 }}></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
