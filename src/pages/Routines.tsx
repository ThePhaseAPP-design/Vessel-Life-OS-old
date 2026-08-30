import { useRoutines } from '../hooks/useRoutines'

function daysAgoLabel(dateStr: string | null): string {
  if (!dateStr) return 'never logged'
  const then = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return `${diffDays} days ago`
}

export default function Routines() {
  const { categories, loading, error, toggleItem } = useRoutines()

  if (loading) {
    return <div className="p-6 text-ink-soft text-sm">Loading your routines…</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-copper-deep">Couldn't load routines: {error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2
        className="text-2xl italic text-ink mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Daily Routines
      </h2>
      <p className="text-sm text-ink-soft mb-4">{categories.length} categories, tended daily.</p>

      {categories.map((cat) => (
        <div key={cat.id} className="card rise-in p-5">
          <h3 className="text-[13px] uppercase tracking-[0.1em] text-copper mb-3">{cat.name}</h3>
          <div className="space-y-2">
            {cat.items.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 py-1.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={item.doneToday}
                  onChange={() => toggleItem(item.id, item.doneToday)}
                  className="mt-1 w-4 h-4 accent-copper cursor-pointer flex-shrink-0"
                />
                <span className="flex-1">
                  <span
                    className={`text-sm ${item.doneToday ? 'line-through text-ink-soft' : 'text-ink'}`}
                  >
                    {item.name}
                  </span>
                  {item.frequency !== 'daily' && (
                    <span className="block text-[11px] text-ink-soft mt-0.5">
                      {item.frequency} · last done {daysAgoLabel(item.lastDoneDate)}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
