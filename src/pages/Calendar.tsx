import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface CalEvent {
  id: string
  date: string
  label: string
  kind: 'task' | 'appointment'
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function Calendar() {
  const [viewDate, setViewDate] = useState(new Date())
  const [selected, setSelected] = useState<string | null>(null)
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: tasks }, { data: appts }] = await Promise.all([
      supabase.from('tasks').select('id, title, due_date').not('due_date', 'is', null),
      supabase.from('appointments').select('id, provider, date'),
    ])
    const merged: CalEvent[] = [
      ...((tasks || []).map((t) => ({ id: t.id, date: t.due_date as string, label: t.title, kind: 'task' as const }))),
      ...((appts || []).map((a) => ({ id: a.id, date: a.date, label: a.provider || 'Appointment', kind: 'appointment' as const }))),
    ]
    setEvents(merged)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const startOffset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const byDate = new Map<string, CalEvent[]>()
  events.forEach((e) => {
    if (!byDate.has(e.date)) byDate.set(e.date, [])
    byDate.get(e.date)!.push(e)
  })

  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  if (loading) return <div className="p-6 text-ink-soft text-sm">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl italic text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Calendar
      </h2>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="text-copper text-lg px-2">‹</button>
          <p className="text-sm font-medium text-ink">{monthLabel}</p>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="text-copper text-lg px-2">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] uppercase text-ink-soft">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const hasEvent = byDate.has(dateKey)
            const isToday = dateKey === todayStr()
            const isSelected = dateKey === selected
            return (
              <button
                key={i}
                onClick={() => setSelected(dateKey)}
                className="aspect-square flex flex-col items-center justify-center rounded-lg text-sm"
                style={{
                  background: isSelected ? 'var(--color-mauve-deep)' : isToday ? 'var(--color-blush)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--color-ink)',
                }}
              >
                {d}
                {hasEvent && <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: isSelected ? 'white' : 'var(--color-copper)' }} />}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className="card p-4">
          <p className="text-sm font-medium text-ink mb-2">{selected}</p>
          {(byDate.get(selected) || []).length === 0 && <p className="text-sm text-ink-soft">Nothing scheduled.</p>}
          {(byDate.get(selected) || []).map((e) => (
            <div key={e.id} className="flex items-center gap-2 py-1.5 border-b border-hairline/60 last:border-0">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.kind === 'appointment' ? 'var(--color-copper)' : 'var(--color-mauve)' }} />
              <span className="text-sm text-ink">{e.label}</span>
              <span className="text-[10px] text-ink-soft ml-auto uppercase">{e.kind}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
