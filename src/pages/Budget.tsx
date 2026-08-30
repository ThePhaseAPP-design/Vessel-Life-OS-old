import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Entry {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string | null
  amount: number
  note: string | null
}

export default function Budget() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('budget_entries').select('*').order('date', { ascending: false })
    setEntries((data as Entry[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!note.trim() || isNaN(amt) || amt <= 0) return
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    await supabase.from('budget_entries').insert({
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
      type,
      note: note.trim(),
      amount: amt,
    })
    setNote('')
    setAmount('')
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('budget_entries').delete().eq('id', id)
    load()
  }

  const balance = entries.reduce((sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount), 0)

  if (loading) return <div className="p-6 text-ink-soft text-sm">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl italic text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Budget
      </h2>

      <div className="card rise-in p-6 text-center card-copper-shadow">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-soft mb-1">Balance</p>
        <p
          className="text-4xl"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: balance >= 0 ? 'var(--color-copper)' : '#a34f4f' }}
        >
          ${balance.toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleAdd} className="card rise-in p-4 space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === 'income' ? 'bg-sage text-white border-sage' : 'border-hairline text-sage'}`}>
            Income
          </button>
          <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === 'expense' ? 'bg-copper text-white border-copper' : 'border-hairline text-copper-deep'}`}>
            Expense
          </button>
        </div>
        <input placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-hairline text-sm" />
        <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-hairline text-sm" />
        <button type="submit" className="w-full py-2 rounded-lg bg-copper text-white text-sm font-medium">Add</button>
      </form>

      <div className="card rise-in p-2">
        {entries.length === 0 && <p className="text-sm text-ink-soft text-center py-6">No entries yet.</p>}
        {entries.slice(0, 30).map((e) => (
          <div key={e.id} className="flex items-center justify-between px-3 py-2.5 border-b border-hairline/60 last:border-0">
            <div>
              <span className="text-sm text-ink">{e.note}</span>
              <span className="block text-[11px] text-ink-soft">{e.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: e.type === 'income' ? 'var(--color-sage)' : 'var(--color-copper)' }}>
                {e.type === 'income' ? '+' : '−'}${e.amount.toFixed(2)}
              </span>
              <button onClick={() => handleDelete(e.id)} className="text-ink-soft hover:text-copper-deep text-xs">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
