import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Routines from './pages/Routines'
import Dashboard from './pages/Dashboard'
import TaskList from './pages/TaskList'
import Budget from './pages/Budget'
import Calendar from './pages/Calendar'
import Beauty from './pages/Beauty'
import Medications from './pages/Medications'
import Qigong from './pages/Qigong'

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'routines', label: 'Routines' },
  { key: 'qigong', label: 'Qigong' },
  { key: 'school', label: 'School' },
  { key: 'work', label: 'Work' },
  { key: 'projects', label: 'Projects' },
  { key: 'budget', label: 'Budget' },
  { key: 'meds', label: 'Meds' },
  { key: 'medical', label: 'Medical' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'calendar', label: 'Calendar' },
]

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p
        className="text-2xl italic text-ink-soft mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}
      </p>
      <p className="text-sm text-ink-soft">Not built yet.</p>
    </div>
  )
}

function Shell() {
  const { signOut } = useAuth()
  const [active, setActive] = useState('dashboard')

  function renderActive() {
    switch (active) {
      case 'dashboard': return <Dashboard />
      case 'routines': return <Routines />
      case 'qigong': return <Qigong />
      case 'school': return <TaskList area="school" label="School" />
      case 'work': return <TaskList area="work" label="Work" />
      case 'projects': return <TaskList area="project" label="Projects" />
      case 'budget': return <Budget />
      case 'meds': return <Medications />
      case 'beauty': return <Beauty />
      case 'calendar': return <Calendar />
      default: return <ComingSoon label={SECTIONS.find((s) => s.key === active)?.label || ''} />
    }
  }

  return (
    <div className="min-h-screen bg-blush-bg">
      <div className="grain" />
      <header className="sticky top-0 z-10 bg-blush-bg/90 backdrop-blur border-b border-hairline">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span
            className="text-xl italic text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vessel
          </span>
          <button onClick={signOut} className="text-xs text-ink-soft hover:text-copper">
            Sign out
          </button>
        </div>
        <nav className="max-w-2xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                active === s.key
                  ? 'bg-mauve-deep text-white'
                  : 'bg-white text-ink-soft border border-hairline'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="relative z-0">{renderActive()}</main>
    </div>
  )
}

function Gate() {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blush-bg text-ink-soft text-sm">
        Loading…
      </div>
    )
  }
  return session ? <Shell /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
