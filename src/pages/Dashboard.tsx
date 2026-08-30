import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getMoonPhase } from '../lib/moonPhase'

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const DEFAULT_SIGNATURE = 'ARIES SUN · GEMINI RISING · SCORPIO MOON–PLUTO · MANIFESTOR 5/1'

export default function Dashboard() {
  const { illumination, phaseName } = getMoonPhase()
  const pct = Math.round(illumination * 100)

  const [signature, setSignature] = useState(DEFAULT_SIGNATURE)
  const [intention, setIntention] = useState('')
  const [savedIntention, setSavedIntention] = useState<string | null>(null)
  const [openTasksCount, setOpenTasksCount] = useState<number | null>(null)
  const [medsToday, setMedsToday] = useState<{ done: number; total: number } | null>(null)
  const [budgetNet, setBudgetNet] = useState<number | null>(null)

  const loadStats = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    const { data: profile } = await supabase.from('profile').select('signature_line').eq('user_id', userId).maybeSingle()
    if (profile?.signature_line) setSignature(profile.signature_line)

    const today = todayStr()

    const { count: taskCount } = await supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('done', false)
    setOpenTasksCount(taskCount ?? 0)

    const { data: meds } = await supabase.from('medications').select('id')
    const { data: medLogs } = await supabase.from('medication_logs').select('medication_id').eq('date', today)
    setMedsToday({ done: (medLogs || []).length, total: (meds || []).length })

    const { data: entries } = await supabase.from('budget_entries').select('type, amount')
    const net = (entries || []).reduce((sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount), 0)
    setBudgetNet(net)

    const { data: intentionRow } = await supabase
      .from('daily_intentions')
      .select('text')
      .eq('date', today)
      .maybeSingle()
    if (intentionRow) setSavedIntention(intentionRow.text)
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const conicStyle = {
    background: `conic-gradient(var(--color-copper) ${pct}%, var(--color-hairline) ${pct}%)`,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      {/* Moon ring — the centerpiece, given real room and a slight asymmetric offset */}
      <div className="flex flex-col items-center text-center rise-in">
        <div
          className="moon-ring w-52 h-52 rounded-full flex items-center justify-center"
          style={conicStyle}
        >
          <div className="w-[168px] h-[168px] rounded-full bg-blush-bg flex flex-col items-center justify-center">
            <span
              className="text-6xl font-light leading-none"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--color-copper-deep)' }}
            >
              {pct}
              <span className="text-2xl align-top">%</span>
            </span>
          </div>
        </div>
        <p className="mt-5 text-2xl italic text-ink" style={{ fontFamily: 'var(--font-display)' }}>{phaseName}</p>
      </div>

      {/* Signature strip */}
      <p className="text-center text-[11px] uppercase tracking-[0.15em] text-ink-soft">{signature}</p>

      {/* Today's intention */}
      <div className="card p-5">
        {savedIntention ? (
          <p className="text-lg italic text-ink text-center" style={{ fontFamily: 'var(--font-display)' }}>
            "{savedIntention}"
          </p>
        ) : (
          <div className="space-y-2">
            <input
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="what are you moving through today?"
              className="w-full text-center italic text-lg bg-transparent border-none outline-none placeholder:text-ink-soft/60"
              style={{ fontFamily: 'var(--font-display)' }}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && intention.trim()) {
                  const { data: userData } = await supabase.auth.getUser()
                  const userId = userData.user?.id
                  if (!userId) return
                  await supabase.from('daily_intentions').insert({
                    user_id: userId,
                    date: todayStr(),
                    text: intention.trim(),
                  })
                  setSavedIntention(intention.trim())
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Quiet utility strip */}
      <div className="flex justify-center gap-6 text-center">
        <div>
          <p className="text-lg text-ink" style={{ fontFamily: 'var(--font-mono)' }}>{openTasksCount ?? '—'}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-soft">open tasks</p>
        </div>
        <div>
          <p className="text-lg text-ink" style={{ fontFamily: 'var(--font-mono)' }}>
            {medsToday ? `${medsToday.done}/${medsToday.total}` : '—'}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-ink-soft">meds today</p>
        </div>
        <div>
          <p className="text-lg" style={{ fontFamily: 'var(--font-mono)', color: (budgetNet ?? 0) >= 0 ? 'var(--color-sage)' : 'var(--color-copper)' }}>
            {budgetNet !== null ? `$${budgetNet.toFixed(0)}` : '—'}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-ink-soft">budget net</p>
        </div>
      </div>
    </div>
  )
}
