import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

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
    <div className="min-h-screen flex items-center justify-center bg-blush-bg px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-4xl italic text-ink mb-2 tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vessel
          </h1>
          <p className="text-[11px] uppercase tracking-[0.12em] text-copper">
            a life, tended
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-ink-soft mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mauve/40"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mauve/40"
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
            className="w-full py-2.5 rounded-xl bg-copper text-white text-sm font-medium tracking-wide hover:bg-copper-deep transition-colors disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
