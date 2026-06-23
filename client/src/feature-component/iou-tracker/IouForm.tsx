import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Loader2 } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import type { Iou, IouType, IouPayload } from '@/types/iou'

interface IouFormProps {
  /** When provided, the form edits this IOU; otherwise it creates a new one. */
  iou?: Iou | null
  /** Throws on failure so the form stays put; resolves on success. */
  onSubmit: (payload: IouPayload) => Promise<void> | void
  /** Called after a successful submit (e.g. to close the host sheet). */
  onSuccess?: () => void
  /** Re-seed the fields whenever this flips (host opens). */
  resetKey?: unknown
}

/**
 * The new-IOU / edit-IOU fields, with no sheet/dialog chrome of its own.
 * Hosted by IouFormSheet (standalone) and by the dashboard QuickAddSheet.
 */
const IouForm: React.FC<IouFormProps> = ({ iou, onSubmit, onSuccess, resetKey }) => {
  const { currency, symbol } = useCurrency()

  const [type, setType] = useState<IouType>('lent')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [expectedPaybackDate, setExpectedPaybackDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setError('')
    setBusy(false)
    setType(iou?.type ?? 'lent')
    setName(iou?.counterpartyName ?? '')
    setPhone(iou?.counterpartyPhone ?? '')
    setAmount(iou ? String(iou.amount) : '')
    setTransactionDate(moment(iou?.transactionDate ?? undefined).format('YYYY-MM-DD'))
    setExpectedPaybackDate(
      iou?.expectedPaybackDate ? moment(iou.expectedPaybackDate).format('YYYY-MM-DD') : ''
    )
    setNote(iou?.note ?? '')
  }, [iou, resetKey])

  const handleSubmit = async () => {
    setError('')
    const amt = Number(amount)
    if (!name.trim()) return setError('Who is this with?')
    if (Number.isNaN(amt) || amt <= 0) return setError('Enter an amount greater than 0')

    const payload: IouPayload = {
      counterpartyName: name.trim(),
      counterpartyPhone: phone.trim() || undefined,
      type,
      amount: amt,
      currency,
      transactionDate: transactionDate || undefined,
      expectedPaybackDate: expectedPaybackDate || null,
      note: note.trim() || undefined,
    }

    setBusy(true)
    try {
      await onSubmit(payload)
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

      {/* Direction */}
      <div className="grid grid-cols-2 gap-2">
        {(['lent', 'borrowed'] as IouType[]).map((t) => {
          const selected = type === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={selected}
              className={`rounded-lg px-3 py-2.5 text-left transition-colors ${
                selected
                  ? 'bg-primary/5 ring-2 ring-primary'
                  : 'bg-grey-x100 hover:bg-grey-x200'
              }`}
            >
              <p className="text-sm font-semibold text-foreground">
                {t === 'lent' ? 'I lent' : 'I borrowed'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t === 'lent' ? 'They owe me' : 'I owe them'}
              </p>
            </button>
          )
        })}
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          Person
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Amount ({symbol})
          </label>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="—"
            className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Date
          </label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Payback by (optional)
          </label>
          <input
            type="date"
            value={expectedPaybackDate}
            onChange={(e) => setExpectedPaybackDate(e.target.value)}
            className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          Note (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's it for?"
          className="w-full h-11 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {iou ? 'Save changes' : 'Add IOU'}
      </button>
    </div>
  )
}

export default IouForm
