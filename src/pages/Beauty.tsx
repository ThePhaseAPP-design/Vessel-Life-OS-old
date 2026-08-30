import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Step {
  id: string
  category: string
  name: string
  lastDone: string | null
}

const CATEGORIES = ['hair', 'skin', 'nails', 'feet'] as const

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function daysAgo(dateStr: string | null) {
  if (!dateStr) return 'never'
  const diff = Math.floor((Date.now() - new Date(dateStr + 'T00:00:00').getTime()) / 86400000)
  if (diff === 0) return 'today'
  if (diff === 1) return 'yesterday'
  return `${diff}d ago`
}

export default function Beauty() {
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState<string>('hair')
  const [newStep, setNewStep] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: stepRows } = await supabase.from('beauty_routine_steps').select('id, category, name')
    const { data: logs } = await supabase.from('beauty_logs').select('step_id, date').order('date', { ascending: false })
    const lastByStep = new Map<string, string>()
    for (const l of logs || []) {
      if (!lastByStep.has(l.step_id)) lastByStep.set(l.step_id, l.date)
    }
    setSteps((stepRows || []).map((s) => ({ ...s, lastDone: lastByStep.get(s.id) || null })))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function logStep(stepId: string) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    await supabase.from('beauty_logs').insert({ user_id: userId, step_id: stepId, date: todayStr() })
    load()
  }

  async function addStep(e: React.FormEvent) {
    e.preventDefault()
    if (!newStep.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    await supabase.from('beauty_routine_steps').insert({ user_id: userId, category: activeCat, name: newStep.trim() })
    setNewStep('')
    load()
  }

  const catSteps = steps.filter((s) => s.category === activeCat)

  if (loading) return <div className="p-6 text-ink-soft text-sm">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl italic text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Beauty & Self-Care
      </h2>

      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize ${
              activeCat === c ? 'bg-mauve-deep text-white' : 'bg-white border border-hairline text-ink-soft'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="card rise-in p-2">
        {catSteps.length === 0 && <p className="text-sm text-ink-soft text-center py-6">No steps yet for {activeCat}.</p>}
        {catSteps.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-3 py-2.5 border-b border-hairline/60 last:border-0">
            <div>
              <span className="text-sm text-ink">{s.name}</span>
              <span className="block text-[11px] text-ink-soft">last done {daysAgo(s.lastDone)}</span>
            </div>
            <button onClick={() => logStep(s.id)} className="px-3 py-1 rounded-full bg-copper text-white text-xs font-medium">
              Log
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={addStep} className="flex gap-2">
        <input
          placeholder={`Add a ${activeCat} step`}
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-hairline text-sm"
        />
        <button type="submit" className="px-4 py-2 rounded-lg border border-mauve text-mauve-deep text-sm font-medium">
          Add
        </button>
      </form>
    </div>
  )
}
