'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ICONS } from "@/lib/constants"

export default function VolunteerRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ firstName: "", lastName: "", age: "", gender: "", email: "", phone: "", password: "", confirmPassword: "", city: "", state: "", pincode: "", travelRadius: "", bio: "", availability: "", agree: false })
  const [skills, setSkills] = useState<Set<string>>(new Set())
  const [interests, setInterests] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toggleChip = (val: string, set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    setFn(next)
  }

  function validateStep1() {
    const e: Record<string, boolean> = {}
    if (!form.firstName.trim()) e.firstName = true
    if (!form.lastName.trim()) e.lastName = true
    if (!form.age || +form.age < 16 || +form.age > 99) e.age = true
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true
    if (form.phone.trim().replace(/\s/g, "").length < 7) e.phone = true
    if (form.password.length < 6) e.password = true
    if (form.password !== form.confirmPassword) e.confirmPassword = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, boolean> = {}
    if (skills.size === 0) e.skills = true
    if (interests.size === 0) e.interests = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep3() {
    const e: Record<string, boolean> = {}
    if (!form.city.trim()) e.city = true
    if (!form.agree) e.terms = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validateStep3()) return
    setLoading(true)

    const skillsArray = Array.from(skills)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          skills: skillsArray,
          city: form.city
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert("Error registering volunteer: " + (data.error || "Email might already exist."))
        setLoading(false)
        return
      }

      setDone(true)
    } catch (err: any) {
      alert("Error: " + err.message)
    }
    setLoading(false)
  }

  const SKILLS = ["Teaching", "Medical / First Aid", "Photography", "Cooking", "Graphic Design", "Web / Tech", "Event Planning", "Fundraising", "Languages", "Legal", "Counselling", "Driving / Logistics"]
  const INTERESTS = ["Education", "Environment", "Animal Welfare", "Healthcare", "Women & Girls", "Elderly Care", "Disaster Relief", "Arts & Culture", "Children", "Food Security", "Community Dev.", "Mental Health"]
  const pct = step === 1 ? 33.3 : step === 2 ? 66.6 : 100

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,var(--secondary),var(--admin))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, fill: "#fff" }}><path d={ICONS.check} /></svg>
        </div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: 10 }}>You're all set! 🎉</h2>
        <p style={{ fontSize: ".9rem", color: "var(--text-muted)", marginBottom: 28 }}>Welcome to SevaConnect. Your registration is complete.</p>
        <button onClick={() => router.push("/login")} style={{ padding: "13px 28px", background: "linear-gradient(135deg,var(--primary),var(--primary-h))", color: "#fff", borderRadius: 12, fontFamily: "'Nunito',sans-serif", fontSize: ".9rem", fontWeight: 700, border: "none", cursor: "pointer" }}>Go to Sign In →</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", overflowX: "hidden" }}>
      <div style={{ background: "linear-gradient(160deg,#1a1a2e 0%,#C8522A 55%,#EDB84A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", position: "relative", overflow: "hidden", minHeight: "100vh" }}>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "2.4rem", fontWeight: 700, color: "#fff", marginBottom: 16 }}>Start your <em style={{ fontStyle: "italic", color: "var(--accent)" }}>journey</em> with us</h1>
          <p style={{ fontSize: ".95rem", color: "rgba(255,255,255,.78)", lineHeight: 1.65, marginBottom: 36 }}>It only takes 2 minutes to register.</p>
          {[["1", "Personal Details", "Tell us who you are — your name, age, and contact info."], ["2", "Skills & Interests", "Help us match you with events that fit your passions."], ["3", "Location & Bio", "Let us know where you're based so we can find nearby opportunities."]].map(([n, t, d]) => (
            <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left", marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: "rgba(255,255,255,.18)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{n}</div>
              <div><strong style={{ color: "#fff", display: "block", fontSize: ".88rem" }}>{t}</strong><span style={{ fontSize: ".85rem", color: "rgba(255,255,255,.8)" }}>{d}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 40px", overflowY: "auto", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 480, paddingBottom: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              {["PERSONAL", "SKILLS", "LOCATION"].map((l, i) => <span key={l} style={{ fontSize: ".72rem", fontWeight: 700, color: step === i + 1 ? "var(--primary)" : step > i + 1 ? "var(--secondary)" : "var(--text-muted)", letterSpacing: .4 }}>{l}</span>)}
            </div>
            <div style={{ height: 5, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--primary),var(--accent))", borderRadius: 10, transition: "width .4s ease" }}></div>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: ".88rem", color: "var(--text-muted)", marginBottom: 28 }}>Join thousands making a difference in Bharat.</p>

          {step === 1 && (
            <div style={{ animation: "fadeIn .35s ease" }}>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.05rem", marginBottom: 20, paddingBottom: 10, borderBottom: "2px solid var(--border)" }}>1. Personal Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["firstName", "First Name", "text", "Priya"], ["lastName", "Last Name", "text", "Sharma"]].map(([k, l, t, p]) => (
                  <div key={k} className="form-field">
                    <label>{l} *</label>
                    <div className="input-wrap">
                      <svg viewBox="0 0 24 24"><path d={ICONS.user} /></svg>
                      <input type={t} placeholder={p} value={(form as any)[k]} onChange={e => upd(k, e.target.value)} style={{ borderColor: errors[k] ? "#e74c3c" : undefined }} />
                    </div>
                    {errors[k] && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>Required</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-field"><label>Age *</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.user} /></svg><input type="number" placeholder="24" value={form.age} onChange={e => upd("age", e.target.value)} style={{ borderColor: errors.age ? "#e74c3c" : undefined }} /></div>{errors.age && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>Valid age (16-99)</div>}</div>
                <div className="form-field"><label>Gender</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.user} /></svg><select value={form.gender} onChange={e => upd("gender", e.target.value)}><option value="">Select…</option>{["Male", "Female", "Non-binary", "Prefer not to say"].map(g => <option key={g}>{g}</option>)}</select></div></div>
              </div>
              <div className="form-field"><label>Email *</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.email} /></svg><input type="email" placeholder="priya@email.com" value={form.email} onChange={e => upd("email", e.target.value)} style={{ borderColor: errors.email ? "#e74c3c" : undefined }} /></div>{errors.email && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>Valid email required</div>}</div>
              <div className="form-field"><label>Phone *</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg><input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => upd("phone", e.target.value)} style={{ borderColor: errors.phone ? "#e74c3c" : undefined }} /></div>{errors.phone && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>Valid phone required</div>}</div>
              <div className="form-field"><label>Password *</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.lock} /></svg><input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => upd("password", e.target.value)} style={{ borderColor: errors.password ? "#e74c3c" : undefined }} /></div>{errors.password && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>Min. 6 characters</div>}</div>
              <div className="form-field"><label>Confirm Password *</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.lock} /></svg><input type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => upd("confirmPassword", e.target.value)} style={{ borderColor: errors.confirmPassword ? "#e74c3c" : undefined }} /></div>{errors.confirmPassword && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>Passwords do not match</div>}</div>
              <button onClick={() => validateStep1() && setStep(2)} style={{ width: "100%", padding: 13, borderRadius: 12, background: "linear-gradient(135deg,var(--primary),var(--primary-h))", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: ".95rem", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(200,82,42,.28)" }}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fadeIn .35s ease" }}>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.05rem", marginBottom: 20, paddingBottom: 10, borderBottom: "2px solid var(--border)" }}>2. Skills & Interests</h3>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: ".82rem", fontWeight: 700, display: "block", marginBottom: 10 }}>Your Skills *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SKILLS.map(s => <button key={s} onClick={() => toggleChip(s, skills, setSkills)} style={{ padding: "7px 14px", border: `2px solid ${skills.has(s) ? "var(--secondary)" : "var(--border)"}`, borderRadius: 20, fontSize: ".8rem", fontWeight: 600, cursor: "pointer", background: skills.has(s) ? "var(--secondary-pale)" : "var(--surface)", color: skills.has(s) ? "var(--admin)" : "var(--text-muted)" }}>{s}</button>)}
                </div>
                {errors.skills && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 8 }}>Select at least one skill</div>}
              </div>
              <div style={{ marginBottom: 16 }}><label style={{ fontSize: ".82rem", fontWeight: 700, display: "block", marginBottom: 10 }}>Areas of Interest *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {INTERESTS.map(s => <button key={s} onClick={() => toggleChip(s, interests, setInterests)} style={{ padding: "7px 14px", border: `2px solid ${interests.has(s) ? "var(--accent)" : "var(--border)"}`, borderRadius: 20, fontSize: ".8rem", fontWeight: 600, cursor: "pointer", background: interests.has(s) ? "var(--accent-pale)" : "var(--surface)", color: interests.has(s) ? "#7a5800" : "var(--text-muted)" }}>{s}</button>)}
                </div>
                {errors.interests && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 8 }}>Select at least one interest</div>}
              </div>
              <div className="form-field"><label>Availability</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.calendar} /></svg><select value={form.availability} onChange={e => upd("availability", e.target.value)}><option value="">Select…</option>{["Weekdays only", "Weekends only", "Both weekdays & weekends", "Flexible / Anytime"].map(a => <option key={a}>{a}</option>)}</select></div></div>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(1)} style={{ padding: "13px 22px", borderRadius: 12, border: "2px solid var(--border)", background: "transparent", fontFamily: "'Nunito',sans-serif", fontSize: ".9rem", fontWeight: 700, color: "var(--text-muted)", cursor: "pointer" }}>← Back</button>
                <button onClick={() => validateStep2() && setStep(3)} style={{ flex: 1, padding: 13, borderRadius: 12, background: "linear-gradient(135deg,var(--primary),var(--primary-h))", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: ".95rem", fontWeight: 700, border: "none", cursor: "pointer" }}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: "fadeIn .35s ease" }}>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: "1.05rem", marginBottom: 20, paddingBottom: 10, borderBottom: "2px solid var(--border)" }}>3. Location & About You</h3>
              <div className="form-field"><label>City / District *</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.pin} /></svg><input type="text" placeholder="e.g. Bangalore" value={form.city} onChange={e => upd("city", e.target.value)} style={{ borderColor: errors.city ? "#e74c3c" : undefined }} /></div>{errors.city && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginTop: 5 }}>City required</div>}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-field"><label>State</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.pin} /></svg><select value={form.state} onChange={e => upd("state", e.target.value)}><option value="">Select…</option>{["Karnataka", "Maharashtra", "Tamil Nadu", "Kerala", "Delhi", "Gujarat", "Other"].map(s => <option key={s}>{s}</option>)}</select></div></div>
                <div className="form-field"><label>Pincode</label><div className="input-wrap"><svg viewBox="0 0 24 24"><path d={ICONS.pin} /></svg><input type="text" placeholder="560001" maxLength={6} value={form.pincode} onChange={e => upd("pincode", e.target.value)} /></div></div>
              </div>
              <div className="form-field"><label>About You</label><div className="input-wrap"><svg viewBox="0 0 24 24" style={{ top: 16, transform: "none" }}><path d={ICONS.edit} /></svg><textarea placeholder="Tell us about your motivation…" maxLength={300} value={form.bio} onChange={e => upd("bio", e.target.value)} style={{ padding: "12px 14px 12px 42px", resize: "vertical", minHeight: 80 }} /></div></div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 8 }}>
                <input type="checkbox" checked={form.agree} onChange={e => upd("agree", e.target.checked)} style={{ marginTop: 3, accentColor: "var(--primary)", width: 16, height: 16 }} />
                <span style={{ fontSize: ".83rem", fontWeight: 600, color: "var(--text-muted)" }}>I agree to the <a href="#" style={{ color: "var(--primary)" }}>Terms & Conditions</a> *</span>
              </label>
              {errors.terms && <div style={{ fontSize: ".75rem", color: "#e74c3c", marginBottom: 8 }}>You must agree to the terms</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(2)} disabled={loading} style={{ padding: "13px 22px", borderRadius: 12, border: "2px solid var(--border)", background: "transparent", fontFamily: "'Nunito',sans-serif", fontSize: ".9rem", fontWeight: 700, color: "var(--text-muted)", cursor: "pointer" }}>← Back</button>
                <button onClick={submit} disabled={loading} style={{ flex: 1, padding: 13, borderRadius: 12, background: "linear-gradient(135deg,var(--secondary),var(--admin))", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: ".95rem", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Registering...' : '🌱 Complete Registration'}
                </button>
              </div>
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: ".84rem", color: "var(--text-muted)" }}>Already registered? <button onClick={() => router.push("/login")} style={{ color: "var(--primary)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Sign in here</button></div>
        </div>
      </div>
    </div>
  )
}