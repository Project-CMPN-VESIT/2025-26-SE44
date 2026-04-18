'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Login failed'); setLoading(false); return }
      if (data.role === 'admin') router.push('/admin-dashboard')
      else router.push('/volunteers/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; }
        .sc-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }

        .sc-left {
          background: #2D6A4F;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem; position: relative; overflow: hidden;
        }
        .sc-left::before {
          content: ''; position: absolute; top: -80px; left: -80px;
          width: 300px; height: 300px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .sc-left::after {
          content: ''; position: absolute; bottom: -60px; right: -60px;
          width: 250px; height: 250px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .sc-heart-box {
          width: 80px; height: 80px; background: rgba(255,255,255,0.15);
          border-radius: 20px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 2rem;
        }
        .sc-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.6rem; text-align: center; color: white;
          line-height: 1.2; margin-bottom: 1rem;
        }
        .sc-left h1 em { font-style: italic; color: #E9A84C; }
        .sc-left p {
          color: rgba(255,255,255,0.8); text-align: center;
          line-height: 1.7; max-width: 340px; font-size: 0.95rem;
        }
        .sc-stats {
          display: flex; gap: 2.5rem; margin-top: 2.5rem;
        }
        .sc-stat { display: flex; flex-direction: column; align-items: center; }
        .sc-stat strong {
          font-size: 1.8rem; font-weight: 700; color: white;
          font-family: 'Playfair Display', serif;
        }
        .sc-stat span {
          font-size: 0.7rem; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.6); font-weight: 600; margin-top: 2px;
        }

        .sc-right {
          background: #FAF7F2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem;
        }
        .sc-brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 2.5rem; align-self: flex-start; width: 100%; max-width: 420px;
        }
        .sc-brand-icon {
          width: 42px; height: 42px; background: #C8522A; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .sc-brand-text { display: flex; flex-direction: column; }
        .sc-brand-text strong { font-size: 1rem; font-weight: 700; color: #1a1a1a; }
        .sc-brand-text span { font-size: 0.7rem; letter-spacing: 0.1em; color: #C8522A; font-weight: 600; }

        .sc-form { width: 100%; max-width: 420px; }
        .sc-form h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; color: #1a1a1a; margin-bottom: 0.4rem;
        }
        .sc-form .sc-sub { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }

        .sc-field { margin-bottom: 1.2rem; }
        .sc-field label { display: block; font-size: 0.85rem; font-weight: 600; color: #333; margin-bottom: 0.5rem; }
        .sc-input-wrap {
          display: flex; align-items: center; gap: 10px;
          background: white; border: 1.5px solid #e0d8d0;
          border-radius: 10px; padding: 0 14px; height: 52px;
          transition: border-color 0.2s;
        }
        .sc-input-wrap:focus-within { border-color: #C8522A; }
        .sc-input-wrap svg { flex-shrink: 0; opacity: 0.4; }
        .sc-input-wrap input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 0.95rem; font-family: 'DM Sans', sans-serif; color: #1a1a1a;
        }
        .sc-eye { background: none; border: none; cursor: pointer; padding: 0; opacity: 0.4; }

        .sc-forgot { text-align: right; margin-top: -0.6rem; margin-bottom: 1.5rem; }
        .sc-forgot a { font-size: 0.82rem; color: #C8522A; text-decoration: none; font-weight: 500; }

        .sc-error { background: #fde8e8; color: #c0392b; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }

        .sc-btn-signin {
          width: 100%; height: 52px; background: #C8522A; color: white;
          border: none; border-radius: 10px; font-size: 1rem; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.2s; margin-bottom: 1.5rem;
        }
        .sc-btn-signin:hover { background: #a83f1e; }
        .sc-btn-signin:disabled { opacity: 0.7; cursor: not-allowed; }

        .sc-divider {
          display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;
        }
        .sc-divider::before, .sc-divider::after {
          content: ''; flex: 1; height: 1px; background: #e0d8d0;
        }
        .sc-divider span { font-size: 0.8rem; color: #aaa; white-space: nowrap; }

        .sc-btn-register {
          width: 100%; height: 52px; background: white; color: #1a1a1a;
          border: 1.5px solid #e0d8d0; border-radius: 10px; font-size: 0.95rem;
          font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s; margin-bottom: 1rem;
        }
        .sc-btn-register:hover { border-color: #C8522A; color: #C8522A; }

        .sc-admin-link { text-align: center; }
        .sc-admin-link a { font-size: 0.85rem; color: #888; text-decoration: none; }
        .sc-admin-link a:hover { color: #C8522A; }

        @media (max-width: 768px) {
          .sc-wrap { grid-template-columns: 1fr; }
          .sc-left { display: none; }
          .sc-right { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="sc-wrap">
        {/* Left Panel */}
        <div className="sc-left">
          <div className="sc-heart-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.7C5.4 17.8 2 13.4 2 9.5 2 6.4 4.4 4 7.5 4c1.7 0 3.3.8 4.5 2.1C13.2 4.8 14.8 4 16.5 4 19.6 4 22 6.4 22 9.5c0 3.9-3.4 8.3-10 12.2z" fill="white"/>
            </svg>
          </div>
          <h1>Make a <em>difference</em><br />today</h1>
          <p>Join thousands of volunteers creating positive change in communities across India.</p>
          <div className="sc-stats">
            <div className="sc-stat">
              <strong>4,200+</strong>
              <span>VOLUNTEERS</span>
            </div>
            <div className="sc-stat">
              <strong>180+</strong>
              <span>EVENTS</span>
            </div>
            <div className="sc-stat">
              <strong>12K hrs</strong>
              <span>GIVEN</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="sc-right">
          <div className="sc-brand">
            <div className="sc-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.7C5.4 17.8 2 13.4 2 9.5 2 6.4 4.4 4 7.5 4c1.7 0 3.3.8 4.5 2.1C13.2 4.8 14.8 4 16.5 4 19.6 4 22 6.4 22 9.5c0 3.9-3.4 8.3-10 12.2z" fill="white"/>
              </svg>
            </div>
            <div className="sc-brand-text">
              <strong>SevaConnect</strong>
              <span>VOLUNTEER PORTAL</span>
            </div>
          </div>

          <div className="sc-form">
            <h2>Sign in</h2>
            <p className="sc-sub">Welcome back! Enter your details to continue.</p>

            {error && <div className="sc-error">{error}</div>}

            <div className="sc-field">
              <label>Email Address</label>
              <div className="sc-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="#333" strokeWidth="1.5"/>
                  <path d="M2 7l10 7 10-7" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="sc-field">
              <label>Password</label>
              <div className="sc-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#333" strokeWidth="1.5"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#333" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button className="sc-eye" onClick={() => setShowPassword(!showPassword)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#333" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="sc-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <button className="sc-btn-signin" onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="sc-divider"><span>new here?</span></div>

            <button className="sc-btn-register" onClick={() => router.push('/signup')}>
              🌱 Register as a Volunteer
            </button>

            <div className="sc-admin-link">
              <a href="#" onClick={() => router.push('/login')}>Admin? Sign in here →</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}