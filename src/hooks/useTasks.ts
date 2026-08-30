import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Task {
  id: string
  title: string
  notes: string | null
  due_date: string | null
  priority: string
  done: boolean
}

export function useTasks(area: 'school' | 'work' | 'project') {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('id, title, notes, due_date, priority, done')
      .eq('area', area)
      .order('due_date', { ascending: true, nullsFirst: false })
    setTasks(data || [])
    setLoading(false)
  }, [area])

  useEffect(() => {
    load()
  }, [load])

  async function addTask(title: string, dueDate: string, priority: string) {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return
    await supabase.from('tasks').insert({
      user_id: userId,
      area,
      title,
      due_date: dueDate || null,
      priority: priority || 'medium',
    })
    await load()
  }

  async function toggleDone(id: string, done: boolean) {
    await supabase.from('tasks').update({ done: !done }).eq('id', id)
    await load()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    await load()
  }

  return { tasks, loading, addTask, toggleDone, deleteTask }
}
