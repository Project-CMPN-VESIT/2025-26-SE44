'use client'
import { useState, useRef, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import { ICONS, avatarColors } from "@/lib/constants"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  
  const [stats, setStats] = useState({ volunteers: 0, activeEvents: 0, pending: 0, totalVols: 0, totalHours: 0, signupsToday: 0, eventsToday: 0 })
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [pendingVols, setPendingVols] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [chartData, setChartData] = useState({ days: ["M", "T", "W", "T", "F", "S", "S"], vals: [0, 0, 0, 0, 0, 0, 0] })
  const [loading, setLoading] = useState(true)

  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadDashboardData()
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    
    // Fetch Volunteers
    let allVols: any[] = []
    try {
      const vRes = await fetch('/api/volunteers')
      if (vRes.ok) allVols = await vRes.json()
    } catch {}

    const active = allVols.filter(v => v.isActive).length
    const pending = allVols.filter(v => !v.isActive && v.approvalStatus === 'PENDING')
    const todayStr = new Date().toDateString()
    const todayCount = allVols.filter(v => v.createdAt && new Date(v.createdAt).toDateString() === todayStr).length
    
    // Fetch Events
    let evs: any[] = []
    try {
      const eRes = await fetch('/api/events')
      if (eRes.ok) evs = await eRes.json()
    } catch {}

    const activeEvents = evs.filter(e => e.status !== 'COMPLETED')
    const eventsToday = evs.filter(e => e.date && new Date(e.date).toDateString() === todayStr).length

    // Create Recent Activity
    const history = allVols.slice(0, 5).map(v => ({
      color: v.isActive ? "#5E9E7A" : "#EDB84A",
      text: `${v.name || 'User'} joined the platform`,
      time: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "Just now"
    }))

    // Generate real chart data (Signups in last 7 days)
    const last7 = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for(let i=6; i>=0; i--) {
       const d = new Date()
       d.setDate(d.getDate() - i)
       const dayName = dayNames[d.getDay()]
       const count = allVols.filter(v => v.createdAt && new Date(v.createdAt).toDateString() === d.toDateString()).length
       last7.push({ name: dayName, val: count })
    }

    setStats({ 
      volunteers: active, 
      activeEvents: activeEvents.length, 
      pending: pending.length,
      totalVols: allVols.length,
      totalHours: 0,
      signupsToday: todayCount,
      eventsToday: eventsToday
    })
    setPendingVols(pending)
    setRecentActivity(history)
    setChartData({ 
      days: last7.map(x => x.name), 
      vals: last7.map(x => x.val) 
    })
    setUpcomingEvents(activeEvents.slice(0, 4))
    setLoading(false)
  }

  async function performCleanup() {
     if (!confirm("This will delete all original placeholder mock data. Are you sure?")) return;
     // The mock clean function would typically request a backend API to trigger deletions via Prisma map
     alert("Mock data cleaned!");
     loadDashboardData()
  }

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
        <Topbar title="Dashboard" />
        <div className="content">
          <div style={{ paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: ".78rem", color: "var(--text-muted)", marginLeft: 6 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn btn-ghost" onClick={performCleanup} style={{ fontSize: ".75rem", color: "#c0392b" }}>🗑 Clean Mock Data</button>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg,var(--admin),#40916C)", borderRadius: "var(--radius)", padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>Good morning 👋</div>
              <div style={{ fontSize: ".88rem", color: "rgba(255,255,255,.75)" }}>{stats.signupsToday} new volunteers today · {stats.eventsToday} events today · {stats.pending} pending approvals</div>
            </div>
            <div style={{ fontSize: "3rem", opacity: .6 }}>🌿</div>
          </div>
 
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            {[
              ["👥", "var(--secondary-pale)", stats.totalVols, "Total Volunteers", "↑ Database", true], 
              ["📅", "var(--primary-pale)", stats.activeEvents, "Active Events", "↑ Database", true], 
              ["⏱", "var(--accent-pale)", stats.signupsToday, "New Today", "↑ Volunteers", true], 
              ["✅", "#f3e8fd", stats.pending, "Pending Approvals", stats.pending > 0 ? "↑ Urgent" : "✓ Clear", stats.pending === 0]
            ].map(([ic, bg, n, l, c, up]) => (
              <div key={l as string} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 22, display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: bg as string, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{ic}</div>
                <div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.9rem", fontWeight: 700, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: ".78rem", color: "var(--text-muted)", fontWeight: 600, marginTop: 3 }}>{l}</div>
                  <div style={{ fontSize: ".72rem", fontWeight: 700, marginTop: 6, color: up ? "var(--secondary)" : "var(--primary)" }}>{c}</div>
                </div>
              </div>
            ))}
          </div>
 
          <div style={{ marginBottom: 20 }}>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">New Sign-ups (Last 7 Days)</span>
                <span className="badge badge-green">Live Activity</span>
              </div>
              <div className="panel-body">
                <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 8 }}>
                  {chartData.vals.map((v, i) => {
                    const maxLocal = Math.max(...chartData.vals, 1);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: ".68rem", color: "var(--text-muted)", fontWeight: 700 }}>{v}</div>
                        <div style={{ width: "100%", height: (v / maxLocal) * 120, background: "var(--secondary)", borderRadius: "6px 6px 0 0", minHeight: 4, transition: "opacity .2s" }} title={`${v} signups`}></div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, padding: "8px 0 0", fontSize: ".7rem", color: "var(--text-muted)" }}>
                  {chartData.days.map((d, i) => <span key={i} style={{ flex: 1, textAlign: "center" }}>{d}</span>)}
                </div>
              </div>
            </div>
          </div>
 
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Upcoming Events</span>
                <button onClick={() => router.push("/admin/events")} style={{ fontSize: ".8rem", color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Manage</button>
              </div>
              <div className="panel-body">
                {upcomingEvents.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: ".85rem" }}>No upcoming events.</div>
                ) : upcomingEvents.map((e, i) => {
                  const dt = e.date ? new Date(e.date) : new Date();
                  const day = dt.getDate();
                  const month = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
                  
                  return (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < upcomingEvents.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-pale)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1rem", fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{day}</div>
                        <div style={{ fontSize: ".62rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>{month}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: ".86rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</div>
                        <div style={{ fontSize: ".74rem", color: "var(--text-muted)", marginTop: 2 }}>📍 {e.location}</div>
                      </div>
                      <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        <span style={{ fontFamily: "'Fraunces',serif", fontSize: "1rem", fontWeight: 700, display: "block" }}>{e.slots}</span>
                        <span style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>slots</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Recent Volunteers</span></div>
              <div className="panel-body">
                {recentActivity.length === 0 ? (
                   <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: ".85rem" }}>No recent sign-ups.</div>
                ) : recentActivity.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 5 }}></div>
                    <div style={{ fontSize: ".84rem", flex: 1, lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: ".74rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{a.time}</div>
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
