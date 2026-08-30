import { useState } from 'react'
import { useMedications } from '../hooks/useMedications'
import { parseSupplementList, type ParsedSupplement } from '../lib/parseSupplements'

export default function Medications() {
  const { meds, loading, error, toggleTaken, addMedication, addMedicationsBulk, deleteMedication } = useMedications()
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [schedule, setSchedule] = useState('')

  const [importText, setImportText] = useState('')
  const [preview, setPreview] = useState<ParsedSupplement[]>([])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await addMedication(name.trim(), dose.trim(), schedule.trim())
    setName('')
    setDose('')
    setSchedule('')
    setShowAdd(false)
  }

  function handlePreviewImport() {
    setPreview(parseSupplementList(importText))
  }

  async function handleConfirmImport() {
    await addMedicationsBulk(preview)
    setImportText('')
    setPreview([])
    setShowImport(false)
  }

  if (loading) return <div className="p-6 text-ink-soft text-sm">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-2xl italic text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Vitamins & Medications
      </h2>
      <p className="text-sm text-ink-soft mb-2">
        {meds.length} tracked · {meds.filter((m) => m.takenToday).length} taken today
      </p>

      {error && <p className="text-sm text-copper-deep">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => { setShowAdd((v) => !v); setShowImport(false) }}
          className="flex-1 py-2.5 rounded-xl border border-dashed border-copper text-copper-deep text-sm font-medium"
        >
          + Add manually
        </button>
        <button
          onClick={() => { setShowImport((v) => !v); setShowAdd(false) }}
          className="flex-1 py-2.5 rounded-xl border border-dashed border-mauve text-mauve-deep text-sm font-medium"
        >
          Import from SuppCo
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="card rise-in p-4 space-y-3">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-hairline text-sm"
          />
          <div className="flex gap-2">
            <input
              placeholder="Dose (e.g. 500mg)"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-hairline text-sm"
            />
            <input
              placeholder="Schedule (e.g. daily AM)"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-hairline text-sm"
            />
          </div>
          <button type="submit" className="w-full py-2 rounded-lg bg-copper text-white text-sm font-medium">
            Add
          </button>
        </form>
      )}

      {showImport && (
        <div className="card rise-in p-4 space-y-3">
          <p className="text-xs text-ink-soft">
            Paste your exported list from SuppCo (or any text list — one supplement per line at minimum).
            We couldn't confirm SuppCo's exact export format, so this parser is forgiving: it'll try to
            detect columns, and you'll see exactly what it found before anything saves.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            placeholder="Vitamin D3, 2000 IU, daily AM&#10;Magnesium Glycinate, 200mg, nightly&#10;..."
            className="w-full px-3 py-2 rounded-lg border border-hairline text-sm font-mono text-xs"
          />
          <button
            onClick={handlePreviewImport}
            className="w-full py-2 rounded-lg border border-mauve text-mauve-deep text-sm font-medium"
          >
            Preview
          </button>

          {preview.length > 0 && (
            <div className="border-t border-hairline pt-3">
              <p className="text-xs text-ink-soft mb-2">{preview.length} found — review before importing:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {preview.map((p, i) => (
                  <div key={i} className="text-sm flex justify-between border-b border-hairline/60 py-1">
                    <span>{p.name}</span>
                    <span className="text-ink-soft text-xs">{[p.dose, p.schedule].filter(Boolean).join(' · ')}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirmImport}
                className="w-full mt-3 py-2 rounded-lg bg-copper text-white text-sm font-medium"
              >
                Import {preview.length} supplements
              </button>
            </div>
          )}
        </div>
      )}

      <div className="card rise-in p-2">
        {meds.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-6">Nothing tracked yet.</p>
        )}
        {meds.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-hairline/60 last:border-0">
            <input
              type="checkbox"
              checked={m.takenToday}
              onChange={() => toggleTaken(m.id, m.takenToday)}
              className="w-4 h-4 accent-copper flex-shrink-0"
            />
            <div className="flex-1">
              <span className={`text-sm ${m.takenToday ? 'line-through text-ink-soft' : 'text-ink'}`}>{m.name}</span>
              {(m.dose || m.schedule) && (
                <span className="block text-[11px] text-ink-soft">
                  {[m.dose, m.schedule].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <button
              onClick={() => deleteMedication(m.id)}
              className="text-ink-soft hover:text-copper-deep text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
