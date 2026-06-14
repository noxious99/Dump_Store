// Domain types for the IOU Tracker feature.
// Framework-agnostic — these transfer directly to the future RN app.

export type IouType = 'lent' | 'borrowed'
export type IouStatus = 'pending' | 'partial' | 'settled' | 'cancelled'

export interface Iou {
  _id: string
  userId: string
  counterpartyName: string
  counterpartyPhone?: string | null
  type: IouType
  amount: number
  amountPaid: number
  currency: string
  transactionDate: string
  expectedPaybackDate?: string | null
  actualPaybackDate?: string | null
  status: IouStatus
  note?: string | null
  createdAt: string
  updatedAt: string
  // Server-computed virtuals
  amountRemaining: number
  isOverdue: boolean
}

export interface IouPayload {
  counterpartyName: string
  counterpartyPhone?: string
  type: IouType
  amount: number
  currency?: string
  transactionDate?: string
  expectedPaybackDate?: string | null
  note?: string
}

export interface IouSummaryPerson {
  name: string
  initial: string
  net: number
}

export interface IouSummary {
  youOwe: number
  owedToYou: number
  net: number
  pendingCount: number
  people: IouSummaryPerson[]
}
