import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import IouForm from './IouForm'
import type { Iou, IouPayload } from '@/types/iou'

interface IouFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the sheet edits this IOU; otherwise it creates a new one. */
  iou?: Iou | null
  onSubmit: (payload: IouPayload) => Promise<void> | void
}

/** Standalone bottom-sheet wrapper around the shared IouForm. */
const IouFormSheet: React.FC<IouFormSheetProps> = ({
  open,
  onOpenChange,
  iou,
  onSubmit,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-0 text-left">
          <SheetTitle className="text-base font-extrabold text-foreground">
            {iou ? 'Edit IOU' : 'New IOU'}
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-4">
          <IouForm
            iou={iou}
            resetKey={open}
            onSubmit={onSubmit}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default IouFormSheet
