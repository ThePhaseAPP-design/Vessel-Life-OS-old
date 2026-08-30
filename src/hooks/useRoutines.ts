import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface RoutineItem {
  id: string
  name: string
  frequency: string
  doneToday: boolean
  lastDoneDate: string | null
}

export interface RoutineCategory {
  id: string
  name: string
  items: RoutineItem[]
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function useRoutines() {
  const [categories, setCategories] = useState<RoutineCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const today = todayStr()

    const { data: cats, error: catErr } = await supabase
      .from('routine_categories')
      .select('id, name, sort_order')
      .order('sort_order')

    if (catErr) {
      setError(catErr.message)
      setLoading(false)
      return
    }

    const { data: items, error: itemErr } = await supabase
      .from('routine_items')
      .select('id, category_id, name, frequency, sort_order')
      .order('sort_order')

    if (itemErr) {
      setError(itemErr.message)
      setLoading(false)
      return
    }

    const { data: logs, error: logErr } = await supabase
      .from('routine_logs')
      .select('item_id, date')
      .order('date', { ascending: false })

    if (logErr) {
      setError(logErr.message)
      setLoading(false)
      return
    }

    const lastLogByItem = new Map<string, string>()
    const doneTodayByItem = new Set<string>()
    for (const log of logs || []) {
      if (!lastLogByItem.has(log.item_id)) lastLogByItem.set(log.item_id, log.date)
      if (log.date === today) doneTodayByItem.add(log.item_id)
    }

    const grouped: RoutineCategory[] = (cats || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: (items || [])
        .filter((it) => it.category_id === cat.id)
        .map((it) => ({
          id: it.id,
          name: it.name,
          frequency: it.frequency,
          doneToday: doneTodayByItem.has(it.id),
          lastDoneDate: lastLogByItem.get(it.id) || null,
        })),
    }))

    setCategories(grouped)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleItem(itemId: string, currentlyDone: boolean) {
    const today = todayStr()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    if (currentlyDone) {
      await supabase.from('routine_logs').delete().eq('item_id', itemId).eq('date', today)
    } else {
      await supabase.from('routine_logs').insert({ item_id: itemId, date: today, user_id: userId, done: true })
    }
    await load()
  }

  return { categories, loading, error, toggleItem, reload: load }
}
