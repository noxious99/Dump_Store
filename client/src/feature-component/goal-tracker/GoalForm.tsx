import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Loader2 } from 'lucide-react'
import type { Goal, GoalCategory, GoalPayload } from '@/types/goal'

interface GoalFormProps {
  /** When provided, the form edits this goal; otherwise it creates a new one. */
  goal?: Goal | null
  /** Throws on failure so the form stays put; resolves on success. */
  onSubmit: (payload: GoalPayload) => Promise<void> | void
  /** Called after a successful submit (e.g. to close the host sheet). */
  onSuccess?: () => void
  /** Re-seed the fields whenever this flips (host opens). */
  resetKey?: unknown
  autoFocus?: boolean
}

const CATEGORIES: { value: GoalCategory; label: string; hint: string }[] = [
  { value: 'shortTerm', label: 'Short term', hint: 'Weeks to a few months' },
  { value: 'longTerm', label: 'Long term', hint: 'Many months or years' },
]

/**
 * The new-goal / edit-goal fields, with no sheet/dialog chrome of its own.
 * Hosted by GoalFormSheet (standalone) and by the dashboard QuickAddSheet.
 */
const GoalForm: React.FC<GoalFormProps> = ({
  goal,
  onSubmit,
  onSuccess,
  resetKey,
  autoFocus = true,
}) => {
  const isEdit = Boolean(goal)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('shortTerm')
  const [targetDate, setTargetDate] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setError('')
    setBusy(false)
    setTitle(goal?.title ?? '')
    setCategory(goal?.category ?? 'shortTerm')
    setTargetDate(goal?.targetDate ? moment(goal.targetDate).format('YYYY-MM-DD') : '')
  }, [goal, resetKey])

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) return setError('Give your goal a title')
    if (!targetDate) return setError('Pick a target date')
    if (moment(targetDate).endOf('day').isSameOrBefore(moment())) {
      return setError('Target date must be in the future')
    }
    setBusy(true)
    try {
      await onSubmit({ title: title.trim(), category, targetDate })
      onSuccess?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-xs font-medium text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          What do you want to achieve?
        </label>
        <input
          type="text"
          autoFocus={autoFocus}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Run a half marathon"
          className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => {
            const selected = category === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={selected}
                className={`text-left rounded-lg px-3 py-2.5 transition-colors ${
                  selected
                    ? 'bg-primary/5 ring-2 ring-primary'
                    : 'bg-grey-x100 hover:bg-grey-x200'
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{c.label}</p>
                <p className="text-[10px] text-muted-foreground">{c.hint}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          Target date
        </label>
        <input
          type="date"
          value={targetDate}
          min={moment().add(1, 'day').format('YYYY-MM-DD')}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEdit ? 'Save changes' : 'Create goal'}
      </button>
    </div>
  )
}

export default GoalForm
