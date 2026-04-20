'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ICONS } from "@/lib/constants"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("shreya@volunteerhub.org")
  const [password, setPassword] = useState("admin123")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function doLogin() {
    setError(false)
    if (!email || !password) {
      setError(true)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(true)
        setLoading(false)
        return
      }

      if (data.role !== 'ADMIN') {
        setError(true)
        setLoading(false)
        await fetch('/api/auth/logout', { method: 'POST' })
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      {[[500, -120, -120, "var(--primary)"], [350, null, -80, "var(--admin)", null, -80], [200, "50%", "20%", "var(--accent)"]].map(([s, t, l, bg, b, r], i) => (
        <div key={i} style={{ position: "fixed", width: s as number, height: s as number, borderRadius: "50%", background: bg as string, opacity: .08, top: t !== null && typeof t === "number" ? t : typeof t === "string" ? t : undefined, bottom: b as any ?? undefined, left: l !== null && typeof l === "number" ? l : typeof l === "string" ? l : undefined, right: r as any ?? undefined, pointerEvents: "none" }}></div>
      ))}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: 48, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(45,36,32,.12)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,var(--admin),#40916C)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: "#fff" }}><path d={ICONS.heart} /></svg>
          </div>
          <div><div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.25rem", fontWeight: 700 }}>SevaConnect</div><div style={{ fontSize: ".72rem", color: "var(--admin)", fontWeight: 700, letterSpacing: .5 }}>ADMIN PORTAL</div></div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,var(--admin),#40916C)", color: "#fff", padding: "6px 14px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, marginBottom: 28 }}>
          <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: "#fff" }}><path d={ICONS.shield} /></svg>Admin Access Only
        </div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: 6 }}>Welcome back</h2>
        <p style={{ fontSize: ".88rem", color: "var(--text-muted)", marginBottom: 32 }}>Sign in to manage your volunteer programs</p>
        
        {error && <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 10, padding: "10px 14px", fontSize: ".82rem", color: "#c0392b", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>⚠ Invalid credentials. Please try again.</div>}
        
        <div className="form-field">
          <label>Email Address</label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24"><path d={ICONS.email} /></svg>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: "var(--admin)" }} onKeyDown={e => e.key === "Enter" && doLogin()} disabled={loading} />
          </div>
        </div>
        <div className="form-field">
          <label>Password</label>
          <div className="input-wrap" style={{ position: "relative" }}>
            <svg viewBox="0 0 24 24"><path d={ICONS.lock} /></svg>
            <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 42, borderColor: "var(--admin)" }} onKeyDown={e => e.key === "Enter" && doLogin()} disabled={loading} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "currentColor" }}><path d={ICONS.eye} /></svg>
            </button>
          </div>
        </div>
        <button onClick={doLogin} disabled={loading} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,var(--admin),#40916C)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: ".95rem", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1, boxShadow: "0 4px 14px rgba(45,106,79,.35)" }}>
          {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0", color: "var(--text-muted)", fontSize: ".8rem" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>or<div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
        </div>
        <button onClick={() => router.push("/login")} disabled={loading} style={{ display: "block", textAlign: "center", padding: 12, border: "2px solid var(--border)", borderRadius: 12, fontSize: ".85rem", fontWeight: 600, color: "var(--text-muted)", width: "100%", background: "none", cursor: "pointer" }}>🤝 Volunteer? Sign in here</button>
      </div>
    </div>
  )
}
