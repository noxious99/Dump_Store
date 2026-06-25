import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import GoalForm from './GoalForm'
import type { Goal, GoalPayload } from '@/types/goal'

interface GoalFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the sheet edits this goal; otherwise it creates a new one. */
  goal?: Goal | null
  onSubmit: (payload: GoalPayload) => Promise<void> | void
}

/** Standalone bottom-sheet wrapper around the shared GoalForm. */
const GoalFormSheet: React.FC<GoalFormSheetProps> = ({
  open,
  onOpenChange,
  goal,
  onSubmit,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[88vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-0 text-left">
          <SheetTitle className="text-base font-extrabold text-foreground">
            {goal ? 'Edit goal' : 'New goal'}
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-4">
          <GoalForm
            goal={goal}
            resetKey={open}
            onSubmit={onSubmit}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default GoalFormSheet
