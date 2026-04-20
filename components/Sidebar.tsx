'use client'
import { useRouter, usePathname } from 'next/navigation'
import { ICONS } from '@/lib/constants'

type SidebarProps = {
  role: 'ADMIN' | 'VOLUNTEER'
  userName: string
  userRoleLabel: string
  avatarLetter: string
  accentColor: string
}

export default function Sidebar({ role, userName, userRoleLabel, avatarLetter, accentColor }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const adminLinks = [
    { section: "Overview" },
    { id: "admin-dashboard", label: "Dashboard", icon: "home", path: "/admin/dashboard" },
    { section: "Management" },
    { id: "volunteer-management", label: "Volunteers", icon: "people", path: "/admin/volunteers" },
    { id: "event-management", label: "Events", icon: "calendar", path: "/admin/events" },
    { section: "Tracking" },
    { id: "attendance-tracking", label: "Attendance", icon: "attendance", path: "/admin/attendance" },
    { section: "Insights" },
    { id: "reports", label: "Reports", icon: "reports", path: "/admin/reports" },
  ]

  const volunteerLinks = [
    { section: "Overview" },
    { id: "volunteer-dashboard", label: "Dashboard", icon: "home", path: "/volunteers/dashboard" },
    { section: "Opportunities" },
    { id: "browse-events", label: "Browse Events", icon: "calendar", path: "/volunteers/events" },
    { id: "my-schedule", label: "My Schedule", icon: "calendar", path: "/volunteers/schedule" },
    { section: "History" },
    { id: "attendance", label: "My Attendance", icon: "attendance", path: "/volunteers/attendance" },
    { id: "participation-history", label: "Impact History", icon: "reports", path: "/volunteers/history" },
  ]

  const links = role === 'ADMIN' ? adminLinks : volunteerLinks

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    if (role === 'ADMIN') {
      router.push('/admin/login')
    } else {
      router.push('/login')
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: `linear-gradient(135deg,${accentColor},#40916C)` }}>
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#fff" }}>
            <path d={ICONS.heart} />
          </svg>
        </div>
        <div>
          <div className="brand-name">SevaConnect</div>
          <span className="brand-role" style={{ color: accentColor }}>{role === 'ADMIN' ? 'Admin Portal' : 'Volunteer Portal'}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((l, i) =>
          'section' in l ? (
            <span key={i} className="nav-section">{l.section}</span>
          ) : (
            <button
              key={l.id}
              className={`nav-item ${pathname === l.path ? "active" : ""}`}
              onClick={() => router.push(l.path)}
            >
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: "currentColor" }}>
                <path d={ICONS[l.icon as keyof typeof ICONS]} />
              </svg>
              {l.label}
            </button>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar-sm" style={{ background: `linear-gradient(135deg,${accentColor},#40916C)` }}>{avatarLetter}</div>
          <div>
            <div className="user-name">{userName}</div>
            <div className="user-role-text" style={{ color: accentColor }}>{userRoleLabel}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24"><path d={ICONS.logout} /></svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
