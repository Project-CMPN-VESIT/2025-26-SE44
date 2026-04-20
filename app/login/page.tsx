'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ICONS } from "@/lib/constants"

export default function VolunteerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function doLogin() {
    setError("")
    if (!email || !password) { setError("empty"); return; }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'Invalid email or password.') {
           setError("badpw");
        } else if (res.status === 404 || data.error?.includes('not found')) {
           setError("notfound");
        } else {
           setError("badpw");
        }
        setLoading(false)
        return
      }

      // Enforce volunteer logic
      if (data.role === 'ADMIN') {
        setError('badpw')
        setLoading(false)
        await fetch('/api/auth/logout', { method: 'POST' })
        return
      }

      router.push('/volunteers/dashboard')
    } catch {
      setError("badpw")
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
      <style>{`.vol-login-hero{background:linear-gradient(160deg,#1a4731 0%,#2D6A4F 40%,#40916C 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 48px;position:relative;overflow:hidden}.hd-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,.06)}.hero-title{font-family:'Fraunces',serif;font-size:2.2rem;font-weight:700;color:#fff;line-height:1.2;margin-bottom:16px}.hero-title em{font-style:italic;color:var(--accent)}`}</style>
      <div className="vol-login-hero">
        <div className="hd-circle" style={{ width: 400, height: 400, bottom: -80, right: -80 }}></div>
        <div className="hd-circle" style={{ width: 250, height: 250, top: -40, left: -40 }}></div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,.15)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", border: "1px solid rgba(255,255,255,.2)" }}>
            <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, fill: "#fff" }}><path d={ICONS.heart} /></svg>
          </div>
          <h1 className="hero-title">Make a <em>difference</em> today</h1>
          <p style={{ fontSize: ".95rem", color: "rgba(255,255,255,.75)", lineHeight: 1.6, marginBottom: 36 }}>Join thousands of volunteers creating positive change in communities across Bangalore.</p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {[["4,200+", "VOLUNTEERS"], ["180+", "EVENTS"], ["12K hrs", "GIVEN"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{n}</div>
                <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)", fontWeight: 600, letterSpacing: .5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", overflowY: "auto", background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,var(--primary),var(--accent))", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#fff" }}><path d={ICONS.heart} /></svg>
            </div>
            <div><div style={{ fontFamily: "'Fraunces',serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>SevaConnect</div><div style={{ fontSize: ".68rem", color: "var(--primary)", fontWeight: 700, letterSpacing: .5 }}>VOLUNTEER PORTAL</div></div>
          </div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.7rem", fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: ".88rem", color: "var(--text-muted)", marginBottom: 32 }}>Welcome back! Enter your details to continue.</p>

          {error === "empty" && <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 12, padding: "12px 16px", fontSize: ".83rem", fontWeight: 600, color: "#c0392b", marginBottom: 18 }}>⚠ Please enter both your email and password.</div>}
          {error === "notfound" && <div style={{ background: "var(--accent-pale)", border: "1px solid #f0d080", borderRadius: 12, padding: "12px 16px", fontSize: ".83rem", fontWeight: 600, color: "#7a5800", marginBottom: 18 }}>⚠️ No account found. <span style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }} onClick={() => router.push("/signup")}>Register first</span>.</div>}
          {error === "badpw" && <div style={{ background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: 12, padding: "12px 16px", fontSize: ".83rem", fontWeight: 600, color: "#c0392b", marginBottom: 18 }}>⚠ Incorrect username or password. Please try again.</div>}

          <div className="form-field">
            <label>Email Address</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24"><path d={ICONS.email} /></svg>
              <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} style={{ borderColor: error === "notfound" || error === "empty" ? "#e74c3c" : undefined }} disabled={loading} />
            </div>
          </div>
          <div className="form-field">
            <label>Password</label>
            <div className="input-wrap" style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24"><path d={ICONS.lock} /></svg>
              <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} style={{ paddingRight: 42, borderColor: error === "badpw" || error === "empty" ? "#e74c3c" : undefined }} disabled={loading} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: "currentColor" }}><path d={ICONS.eye} /></svg>
              </button>
            </div>
            <a href="#" style={{ fontSize: ".8rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none", display: "block", textAlign: "right", marginTop: 6 }}>Forgot password?</a>
          </div>

          <button onClick={doLogin} disabled={loading} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg,var(--primary),var(--primary-h))", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: ".95rem", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1, marginTop: 8, boxShadow: "0 4px 14px rgba(200,82,42,.3)" }}>
             {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0", color: "var(--text-muted)", fontSize: ".8rem" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>new here?<div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
          </div>
          <button onClick={() => router.push("/signup")} disabled={loading} style={{ display: "block", textAlign: "center", padding: 12, border: "2px solid var(--border)", borderRadius: 12, fontSize: ".85rem", fontWeight: 600, color: "var(--text-muted)", width: "100%", background: "none", cursor: "pointer" }}>🌱 Register as a Volunteer</button>
          <button onClick={() => router.push("/admin/login")} disabled={loading} style={{ display: "block", textAlign: "center", fontSize: ".8rem", color: "var(--text-muted)", marginTop: 20, background: "none", border: "none", cursor: "pointer", width: "100%" }}>Admin? Sign in here →</button>
        </div>
      </div>
    </div>
  )
}
