'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ICONS, SKILLS, AREAS } from '@/lib/constants'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    area: '',
    agree: false
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  function upd(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: false }))
  }

  function toggleSkill(skill: string) {
    setSkills(prev => {
      const next = new Set(prev)
      next.has(skill) ? next.delete(skill) : next.add(skill)
      return next
    })
  }

  function validateStep1() {
    const e: Record<string, boolean> = {}
    if (!form.name.trim()) e.name = true
    if (!form.email.trim()) e.email = true
    if (!form.phone.trim()) e.phone = true
    if (form.password.length < 6) e.password = true
    if (form.password !== form.confirmPassword) e.confirmPassword = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, boolean> = {}
    if (skills.size === 0) e.skills = true
    if (!form.area) e.area = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep3() {
    const e: Record<string, boolean> = {}
    if (!form.agree) e.terms = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validateStep3()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        area: form.area,
        skills: Array.from(skills)
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: '2px solid var(--border)',
        padding: 40,
        width: '100%',
        maxWidth: 480
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Fraunces',serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 6
          }}>
            Join SevaConnect
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Step {step} of 3
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6,
          background: 'var(--border)',
          borderRadius: 4,
          marginBottom: 28,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${(step / 3) * 100}%`,
            background: 'linear-gradient(135deg,var(--primary),var(--primary-h))',
            borderRadius: 4,
            transition: 'width .3s ease'
          }} />
        </div>

        {error && (
          <div style={{
            background: '#fde8e8',
            color: '#c0392b',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: '.85rem',
            fontWeight: 700,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn .35s ease' }}>
            <h3 style={{
              fontFamily: "'Fraunces',serif",
              fontSize: '1.05rem',
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: '2px solid var(--border)'
            }}>
              1. Personal Information
            </h3>

            <div className="form-field">
              <label>Full Name *</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.user} /></svg>
                <input
                  type="text"
                  placeholder="Priya Sharma"
                  value={form.name}
                  onChange={e => upd('name', e.target.value)}
                  style={{ borderColor: errors.name ? '#e74c3c' : undefined }}
                />
              </div>
              {errors.name && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 5 }}>Required</div>}
            </div>

            <div className="form-field">
              <label>Email *</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.email} /></svg>
                <input
                  type="email"
                  placeholder="priya@email.com"
                  value={form.email}
                  onChange={e => upd('email', e.target.value)}
                  style={{ borderColor: errors.email ? '#e74c3c' : undefined }}
                />
              </div>
              {errors.email && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 5 }}>Valid email required</div>}
            </div>

            <div className="form-field">
              <label>Phone *</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => upd('phone', e.target.value)}
                  style={{ borderColor: errors.phone ? '#e74c3c' : undefined }}
                />
              </div>
              {errors.phone && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 5 }}>Valid phone required</div>}
            </div>

            <div className="form-field">
              <label>Password *</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.lock} /></svg>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => upd('password', e.target.value)}
                  style={{ borderColor: errors.password ? '#e74c3c' : undefined }}
                />
              </div>
              {errors.password && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 5 }}>Min. 6 characters</div>}
            </div>

            <div className="form-field">
              <label>Confirm Password *</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.lock} /></svg>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={e => upd('confirmPassword', e.target.value)}
                  style={{ borderColor: errors.confirmPassword ? '#e74c3c' : undefined }}
                />
              </div>
              {errors.confirmPassword && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 5 }}>Passwords do not match</div>}
            </div>

            <button
              onClick={() => validateStep1() && setStep(2)}
              style={{
                width: '100%', padding: 13, borderRadius: 12,
                background: 'linear-gradient(135deg,var(--primary),var(--primary-h))',
                color: '#fff', fontFamily: "'Nunito',sans-serif",
                fontSize: '.95rem', fontWeight: 700, border: 'none', cursor: 'pointer'
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Skills & Area */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn .35s ease' }}>
            <h3 style={{
              fontFamily: "'Fraunces',serif",
              fontSize: '1.05rem',
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: '2px solid var(--border)'
            }}>
              2. Skills & Area
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '.82rem', fontWeight: 700, display: 'block', marginBottom: 10 }}>
                Your Skills *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SKILLS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    style={{
                      padding: '7px 14px',
                      border: `2px solid ${skills.has(s) ? 'var(--secondary)' : 'var(--border)'}`,
                      borderRadius: 20,
                      fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
                      background: skills.has(s) ? 'var(--secondary-pale)' : 'var(--surface)',
                      color: skills.has(s) ? 'var(--admin)' : 'var(--text-muted)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.skills && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 8 }}>Select at least one skill</div>}
            </div>

            <div className="form-field">
              <label>Area *</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24"><path d={ICONS.pin} /></svg>
                <select
                  value={form.area}
                  onChange={e => upd('area', e.target.value)}
                  style={{ borderColor: errors.area ? '#e74c3c' : undefined }}
                >
                  <option value="">Select area…</option>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              {errors.area && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginTop: 5 }}>Please select an area</div>}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '13px 22px', borderRadius: 12,
                  border: '2px solid var(--border)', background: 'transparent',
                  fontFamily: "'Nunito',sans-serif", fontSize: '.9rem',
                  fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => validateStep2() && setStep(3)}
                style={{
                  flex: 1, padding: 13, borderRadius: 12,
                  background: 'linear-gradient(135deg,var(--primary),var(--primary-h))',
                  color: '#fff', fontFamily: "'Nunito',sans-serif",
                  fontSize: '.95rem', fontWeight: 700, border: 'none', cursor: 'pointer'
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn .35s ease' }}>
            <h3 style={{
              fontFamily: "'Fraunces',serif",
              fontSize: '1.05rem',
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: '2px solid var(--border)'
            }}>
              3. Confirm & Submit
            </h3>

            <div style={{
              background: 'var(--bg)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              fontSize: '.88rem'
            }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Name: </span>
                <span style={{ fontWeight: 700 }}>{form.name}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Email: </span>
                <span style={{ fontWeight: 700 }}>{form.email}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Area: </span>
                <span style={{ fontWeight: 700 }}>{form.area}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Skills: </span>
                <span style={{ fontWeight: 700 }}>{Array.from(skills).join(', ')}</span>
              </div>
            </div>

            <label style={{
              display: 'flex', alignItems: 'flex-start',
              gap: 10, cursor: 'pointer', marginBottom: 8
            }}>
              <input
                type="checkbox"
                checked={form.agree}
                onChange={e => upd('agree', e.target.checked)}
                style={{ marginTop: 3, accentColor: 'var(--primary)', width: 16, height: 16 }}
              />
              <span style={{ fontSize: '.83rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                I agree to the Terms & Conditions *
              </span>
            </label>
            {errors.terms && <div style={{ fontSize: '.75rem', color: '#e74c3c', marginBottom: 8 }}>You must agree to the terms</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '13px 22px', borderRadius: 12,
                  border: '2px solid var(--border)', background: 'transparent',
                  fontFamily: "'Nunito',sans-serif", fontSize: '.9rem',
                  fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  flex: 1, padding: 13, borderRadius: 12,
                  background: 'linear-gradient(135deg,var(--secondary),var(--admin))',
                  color: '#fff', fontFamily: "'Nunito',sans-serif",
                  fontSize: '.95rem', fontWeight: 700, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? .7 : 1
                }}
              >
                {loading ? 'Creating account...' : '🌱 Complete Registration'}
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '.84rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <button
            onClick={() => router.push('/login')}
            style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  )
}