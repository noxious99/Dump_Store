import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCurrency } from '@/hooks/useCurrency'
import type { Iou, IouType, IouPayload } from '@/types/iou'

interface IouFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the sheet edits this IOU; otherwise it creates a new one. */
  iou?: Iou | null
  onSubmit: (payload: IouPayload) => Promise<void> | void
}

const IouFormSheet: React.FC<IouFormSheetProps> = ({
  open,
  onOpenChange,
  iou,
  onSubmit,
}) => {
  const { currency, symbol } = useCurrency()
  const isEdit = Boolean(iou)

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
    if (open) {
      setError('')
      setBusy(false)
      setType(iou?.type ?? 'lent')
      setName(iou?.counterpartyName ?? '')
      setPhone(iou?.counterpartyPhone ?? '')
      setAmount(iou ? String(iou.amount) : '')
      setTransactionDate(
        moment(iou?.transactionDate ?? undefined).format('YYYY-MM-DD')
      )
      setExpectedPaybackDate(
        iou?.expectedPaybackDate ? moment(iou.expectedPaybackDate).format('YYYY-MM-DD') : ''
      )
      setNote(iou?.note ?? '')
    }
  }, [open, iou])

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
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-0 text-left">
          <SheetTitle className="text-base font-extrabold text-foreground">
            {isEdit ? 'Edit IOU' : 'New IOU'}
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-4 space-y-4">
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
            {isEdit ? 'Save changes' : 'Add IOU'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default IouFormSheet
