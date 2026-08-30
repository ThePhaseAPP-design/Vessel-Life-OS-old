import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function VesselMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-4">
      <path
        d="M20 6 C11 6 6 14 6 22 C6 30 12 34 20 34 C28 34 34 30 34 22 C34 14 29 6 20 6 Z"
        stroke="var(--color-copper)"
        strokeWidth="1"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M14 16 C14 24 26 24 26 16"
        stroke="var(--color-copper)"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="20" cy="12" r="1.4" fill="var(--color-copper)" />
    </svg>
  )
}

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="grain" />
      <div className="w-full max-w-sm relative z-10 rise-in">
        <div className="text-center mb-8">
          <VesselMark />
          <h1
            className="text-5xl italic text-ink mb-2 tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vessel
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-copper">
            a life, tended
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card card-copper-shadow p-8 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-ink-soft mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mauve/40 transition-shadow"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-ink-soft mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mauve/40 transition-shadow"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-copper-deep bg-blush/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-copper text-white text-sm font-medium tracking-wide hover:bg-copper-deep transition-all disabled:opacity-60 shadow-[0_8px_20px_rgba(184,122,69,0.28)] hover:shadow-[0_10px_26px_rgba(184,122,69,0.36)] hover:-translate-y-px"
          >
            {submitting ? 'Signing in…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
