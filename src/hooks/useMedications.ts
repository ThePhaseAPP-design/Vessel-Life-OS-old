import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Medication {
  id: string
  name: string
  dose: string | null
  schedule: string | null
  takenToday: boolean
}

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function useMedications() {
  const [meds, setMeds] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const today = todayStr()

    const { data: medRows, error: medErr } = await supabase
      .from('medications')
      .select('id, name, dose, schedule')
      .order('name')

    if (medErr) {
      setError(medErr.message)
      setLoading(false)
      return
    }

    const { data: logs, error: logErr } = await supabase
      .from('medication_logs')
      .select('medication_id, date')
      .eq('date', today)

    if (logErr) {
      setError(logErr.message)
      setLoading(false)
      return
    }

    const takenIds = new Set((logs || []).map((l) => l.medication_id))

    setMeds(
      (medRows || []).map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        schedule: m.schedule,
        takenToday: takenIds.has(m.id),
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleTaken(medId: string, currentlyTaken: boolean) {
    const today = todayStr()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    if (currentlyTaken) {
      await supabase.from('medication_logs').delete().eq('medication_id', medId).eq('date', today)
    } else {
      await supabase.from('medication_logs').insert({ medication_id: medId, date: today, user_id: userId })
    }
    await load()
  }

  async function addMedication(name: string, dose: string, schedule: string) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    await supabase.from('medications').insert({ user_id: userId, name, dose, schedule })
    await load()
  }

  async function addMedicationsBulk(rows: { name: string; dose: string; schedule: string }[]) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    const payload = rows.map((r) => ({ user_id: userId, name: r.name, dose: r.dose || null, schedule: r.schedule || null }))
    await supabase.from('medications').insert(payload)
    await load()
  }

  async function deleteMedication(medId: string) {
    await supabase.from('medications').delete().eq('id', medId)
    await load()
  }

  return { meds, loading, error, toggleTaken, addMedication, addMedicationsBulk, deleteMedication }
}
