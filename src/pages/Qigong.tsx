import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Practice {
  id: string
  name: string
  session1Done: boolean
  session2Done: boolean
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function Qigong() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const today = todayStr()

    const { data: rows } = await supabase
      .from('qigong_practices')
      .select('id, name, sort_order')
      .order('sort_order')

    const { data: logs } = await supabase
      .from('qigong_logs')
      .select('practice_id, session')
      .eq('date', today)

    const s1 = new Set((logs || []).filter((l) => l.session === 1).map((l) => l.practice_id))
    const s2 = new Set((logs || []).filter((l) => l.session === 2).map((l) => l.practice_id))

    setPractices(
      (rows || []).map((r) => ({
        id: r.id,
        name: r.name,
        session1Done: s1.has(r.id),
        session2Done: s2.has(r.id),
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addPractice(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    await supabase.from('qigong_practices').insert({ user_id: userId, name: newName.trim(), sort_order: practices.length })
    setNewName('')
    load()
  }

  async function toggleSession(practiceId: string, session: 1 | 2, currentlyDone: boolean) {
    const today = todayStr()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    if (currentlyDone) {
      await supabase.from('qigong_logs').delete().eq('practice_id', practiceId).eq('date', today).eq('session', session)
    } else {
      await supabase.from('qigong_logs').insert({ user_id: userId, practice_id: practiceId, date: today, session })
    }
    load()
  }

  async function deletePractice(practiceId: string) {
    await supabase.from('qigong_practices').delete().eq('id', practiceId)
    load()
  }

  if (loading) return <div className="p-6 text-ink-soft text-sm">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl italic text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Qigong
      </h2>
      <p className="text-sm text-ink-soft mb-2">Each practice can be logged up to twice a day.</p>

      <form onSubmit={addPractice} className="flex gap-2">
        <input
          placeholder="Add a practice — e.g. Eight Brocades"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-hairline text-sm"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-copper text-white text-sm font-medium">
          Add
        </button>
      </form>

      <div className="card p-2">
        {practices.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-6">No practices yet — add your first above.</p>
        )}
        {practices.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-3 py-3 border-b border-hairline/60 last:border-0">
            <span className="text-sm text-ink flex-1">{p.name}</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.session1Done}
                  onChange={() => toggleSession(p.id, 1, p.session1Done)}
                  className="w-4 h-4 accent-copper"
                />
                AM
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.session2Done}
                  onChange={() => toggleSession(p.id, 2, p.session2Done)}
                  className="w-4 h-4 accent-copper"
                />
                PM
              </label>
              <button onClick={() => deletePractice(p.id)} className="text-ink-soft hover:text-copper-deep text-xs">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
