import { useState } from 'react'
import { useTasks, type Task } from '../hooks/useTasks'

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--color-copper)',
  medium: 'var(--color-mauve)',
  low: 'var(--color-sage)',
}

export default function TaskList({ area, label }: { area: 'school' | 'work' | 'project'; label: string }) {
  const { tasks, loading, addTask, toggleDone, deleteTask } = useTasks(area)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addTask(title.trim(), dueDate, priority)
    setTitle('')
    setDueDate('')
  }

  const open = tasks.filter((t: Task) => !t.done)
  const done = tasks.filter((t: Task) => t.done)

  if (loading) return <div className="p-6 text-ink-soft text-sm">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl italic text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        {label}
      </h2>
      <p className="text-sm text-ink-soft mb-2">{open.length} open</p>

      <form onSubmit={handleAdd} className="card rise-in p-4 flex gap-2 flex-wrap">
        <input
          placeholder="New task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-hairline text-sm"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-hairline text-sm"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 rounded-lg border border-hairline text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded-lg bg-copper text-white text-sm font-medium">
          Add
        </button>
      </form>

      <div className="card rise-in p-2">
        {open.length === 0 && <p className="text-sm text-ink-soft text-center py-6">Nothing open.</p>}
        {open.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-hairline/60 last:border-0">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: PRIORITY_COLOR[t.priority] || 'var(--color-mauve)' }}
            />
            <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id, t.done)} className="w-4 h-4 accent-copper" />
            <div className="flex-1">
              <span className="text-sm text-ink">{t.title}</span>
              {t.due_date && <span className="block text-[11px] text-ink-soft">{t.due_date}</span>}
            </div>
            <button onClick={() => deleteTask(t.id)} className="text-ink-soft hover:text-copper-deep text-xs">✕</button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <details className="card rise-in p-3">
          <summary className="text-xs text-ink-soft cursor-pointer">{done.length} completed</summary>
          <div className="mt-2 space-y-1">
            {done.map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm text-ink-soft">
                <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id, t.done)} className="w-4 h-4" />
                <span className="line-through flex-1">{t.title}</span>
                <button onClick={() => deleteTask(t.id)} className="text-xs">✕</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
