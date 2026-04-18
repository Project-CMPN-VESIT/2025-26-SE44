'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ICONS } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    // Redirect based on role
    if (data.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else {
      router.push('/volunteers/dashboard')
    }
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
        maxWidth: 420
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg,var(--primary),var(--primary-h))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#fff' }}>
              <path d={ICONS.heart} />
            </svg>
          </div>
          <div style={{
            fontFamily: "'Fraunces',serif",
            fontSize: '1.6rem',
            fontWeight: 700,
            marginBottom: 6
          }}>
            SevaConnect
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Sign in to your account
          </div>
        </div>

        {/* Error */}
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

        {/* Email */}
        <div className="form-field">
          <label>Email</label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24">
              <path d={ICONS.email} />
            </svg>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-field">
          <label>Password</label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24">
              <path d={ICONS.lock} />
            </svg>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: 13,
            borderRadius: 12,
            background: 'linear-gradient(135deg,var(--primary),var(--primary-h))',
            color: '#fff',
            fontFamily: "'Nunito',sans-serif",
            fontSize: '.95rem',
            fontWeight: 700,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? .7 : 1,
            marginTop: 8
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Signup link */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: '.84rem',
          color: 'var(--text-muted)'
        }}>
          New volunteer?{' '}
          <button
            onClick={() => router.push('/signup')}
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  )
}
