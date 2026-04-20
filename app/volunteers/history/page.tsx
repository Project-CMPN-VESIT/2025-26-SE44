'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

type AttendanceRecord = {
  id: string
  status: 'PRESENT' | 'ABSENT'
  hoursLogged: number
  markedAt: string
  event: {
    title: string
    date: string
    location: string
    category?: string
  }
}

export default function ParticipationHistory() {
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const profRes = await fetch('/api/volunteers/me')
      if (profRes.ok) setProfile(await profRes.json())

      const res = await fetch('/api/attendance')
      if (res.ok) setHistory(await res.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const totalHours = history.reduce((acc, curr) => acc + (curr.status === 'PRESENT' ? curr.hoursLogged : 0), 0)

  function downloadCertificate(record: AttendanceRecord) {
    const volunteerName = profile?.name || "Volunteer"
    const eventTitle = record.event.title
    const eventDate = new Date(record.event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    const hours = record.hoursLogged

    // Generate a beautiful SVG certificate
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a4731"/>
      <stop offset="100%" style="stop-color:#2D6A4F"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect x="20" y="20" width="760" height="560" rx="12" fill="#FAF7F2" stroke="#C8522A" stroke-width="3"/>
  <rect x="32" y="32" width="736" height="536" rx="8" fill="none" stroke="#EDB84A" stroke-width="1" stroke-dasharray="8,4"/>
  
  <!-- Header -->
  <text x="400" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#C8522A" letter-spacing="4">CERTIFICATE OF PARTICIPATION</text>
  
  <!-- Logo area -->
  <text x="400" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#2D6A4F" font-weight="bold">SevaConnect</text>
  <text x="400" y="152" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#888" letter-spacing="3">VOLUNTEER PLATFORM</text>
  
  <!-- Divider -->
  <line x1="200" y1="175" x2="600" y2="175" stroke="#EDB84A" stroke-width="1"/>
  
  <!-- Body -->
  <text x="400" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#666">This is to certify that</text>
  <text x="400" y="265" text-anchor="middle" font-family="Georgia,serif" font-size="32" fill="#1a1a1a" font-weight="bold">${volunteerName}</text>
  <line x1="200" y1="280" x2="600" y2="280" stroke="#C8522A" stroke-width="0.5"/>
  
  <text x="400" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#666">has successfully volunteered at</text>
  <text x="400" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#2D6A4F" font-weight="bold">${eventTitle}</text>
  
  <text x="400" y="400" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#666">on ${eventDate} and contributed ${hours} hours of service</text>
  
  <!-- Footer -->
  <line x1="200" y1="450" x2="600" y2="450" stroke="#EDB84A" stroke-width="1"/>
  
  <text x="250" y="500" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#1a1a1a" font-weight="bold">SevaConnect Admin</text>
  <text x="250" y="518" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#888">Program Director</text>
  <line x1="170" y1="485" x2="330" y2="485" stroke="#333" stroke-width="0.5"/>
  
  <text x="550" y="500" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#1a1a1a" font-weight="bold">${eventDate}</text>
  <text x="550" y="518" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#888">Date of Issue</text>
  <line x1="470" y1="485" x2="630" y2="485" stroke="#333" stroke-width="0.5"/>
  
  <!-- Seal -->
  <circle cx="400" cy="510" r="28" fill="none" stroke="#EDB84A" stroke-width="2"/>
  <circle cx="400" cy="510" r="23" fill="none" stroke="#EDB84A" stroke-width="1"/>
  <text x="400" y="507" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#C8522A" font-weight="bold">SEVA</text>
  <text x="400" y="519" text-anchor="middle" font-family="Georgia,serif" font-size="7" fill="#C8522A">CONNECT</text>
</svg>`

    // Convert SVG to downloadable PNG via canvas
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          const pngUrl = URL.createObjectURL(pngBlob)
          const link = document.createElement('a')
          link.href = pngUrl
          link.download = `Certificate_${eventTitle.replace(/\s+/g, '_')}.png`
          link.click()
          URL.revokeObjectURL(pngUrl)
        }
      }, 'image/png')
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  // Donut chart logic based on actual history
  const categoryHours: Record<string, number> = {}
  history.forEach(h => {
    if (h.status === 'PRESENT') {
      const cat = h.event.category || 'Community'
      categoryHours[cat] = (categoryHours[cat] || 0) + h.hoursLogged
    }
  })

  const catColors: Record<string, string> = {
    "Environment": "#5E9E7A",
    "Community": "#3498db",
    "Healthcare": "#C8522A",
    "Education": "#EDB84A",
    "Animal Welfare": "#9b59b6",
    "Elderly Care": "#e67e22",
    "Children": "#e84393"
  }

  const CATEGORIES = Object.keys(categoryHours).map(cat => ({
    label: cat,
    color: catColors[cat] || "#2D6A4F",
    value: categoryHours[cat]
  }))
  let offset = 0
  const arcs = CATEGORIES.map(cat => {
    const dash = totalHours ? (cat.value / totalHours) * 251.3 : 0
    const gap = 251.3 - dash
    const arc = { ...cat, dash, gap, offset: -offset }
    offset += dash
    return arc
  }).filter(a => a.value > 0)

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
        <Topbar title="Participation History" />
        
        <div className="content">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Previous Events</span>
              </div>
              <div className="panel-body">
                <table style={{ minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Hours</th>
                      <th>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: 30 }}>Loading history...</td></tr>
                    ) : history.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: 30 }}>No history found.</td></tr>
                    ) : history.map((h) => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 700 }}>{h.event.title}</td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {new Date(h.event.date).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                          {h.status === 'PRESENT' ? h.hoursLogged : 0}h
                        </td>
                        <td>
                          {h.status === 'PRESENT' ? (
                            <button 
                              onClick={() => downloadCertificate(h)}
                              style={{ 
                                padding: "6px 14px", borderRadius: 8, 
                                background: "linear-gradient(135deg,var(--admin),#2D6A4F)", 
                                color: "#fff", border: "none", cursor: "pointer",
                                fontFamily: "'Nunito',sans-serif", fontSize: ".78rem", fontWeight: 700,
                                display: "flex", alignItems: "center", gap: 5
                              }}
                            >
                              📜 Download
                            </button>
                          ) : (
                            <span style={{ fontSize: ".8rem", color: "var(--text-muted)", fontStyle: "italic" }}>Not eligible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Impact Summary</span>
                </div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                    <svg width="120" height="120" viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
                      <circle cx="55" cy="55" r="40" fill="none" stroke="var(--border)" strokeWidth="18" />
                      {arcs.map((arc, i) => (
                        <circle 
                          key={i} 
                          cx="55" cy="55" r="40" fill="none" 
                          stroke={arc.color} strokeWidth="18" 
                          strokeDasharray={`${arc.dash} ${arc.gap}`} 
                          strokeDashoffset={arc.offset} 
                          transform="rotate(-90 55 55)" 
                        />
                      ))}
                      <text x="55" y="58" textAnchor="middle" fontFamily="'Fraunces',serif" fontSize="16" fontWeight="700" fill="var(--text)">
                        {totalHours}h
                      </text>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                      {arcs.map(arc => (
                        <div key={arc.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".9rem" }}>
                          <div style={{ width: 12, height: 12, borderRadius: "50%", background: arc.color, flexShrink: 0 }}></div>
                          <span style={{ color: "var(--text-muted)", flex: 1 }}>{arc.label}</span>
                          <span style={{ fontWeight: 700 }}>{Math.round(arc.value)}h</span>
                        </div>
                      ))}
                      {history.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--text-muted)' }}>No impact data yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
