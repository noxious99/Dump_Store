import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import ExpenseForm from "./ExpenseForm";
import IncomeForm from "./IncomeForm";
import type {
    ExpensePayload,
    IncomePayload,
    ExpenseRecord,
} from "@/types/expenseTracker";

export type TransactionMode = "expense" | "income";

type TransactionAdderProps = {
    // null = closed; a mode = open on that tab
    openMode: TransactionMode | null;
    onClose: () => void;
    addExpense: (expenseData: ExpensePayload, opts?: { undoable?: boolean }) => Promise<ExpenseRecord | null>;
    addIncome: (incomeData: IncomePayload) => void;
    isExpenseLoading: boolean;
    isIncomeLoading: boolean;
    categories: { _id: string; name: string }[];
    expenseRecords?: ExpenseRecord[];
};

const TransactionAdder: React.FC<TransactionAdderProps> = ({
    openMode,
    onClose,
    addExpense,
    addIncome,
    isExpenseLoading,
    isIncomeLoading,
    categories,
    expenseRecords = [],
}) => {
    const [mode, setMode] = useState<TransactionMode>("expense");
    const isMobile = useIsMobile();
    const isOpen = openMode !== null;

    // Land on the tab the caller asked for each time the adder opens
    useEffect(() => {
        if (openMode) setMode(openMode);
    }, [openMode]);

    const handleOpenChange = (open: boolean) => {
        if (!open) onClose();
    };

    // Active tab keeps the financial color cue (error = money out, success = money in)
    // mr-9 keeps the segmented control clear of the sheet/dialog close (X) button
    const segment = (
        <div className="flex bg-grey-x100 rounded-lg p-1 mb-3 mr-9">
            <button
                type="button"
                onClick={() => setMode("expense")}
                aria-pressed={mode === "expense"}
                className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors ${
                    mode === "expense"
                        ? "bg-card shadow-sm text-error"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Expense
            </button>
            <button
                type="button"
                onClick={() => setMode("income")}
                aria-pressed={mode === "income"}
                className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors ${
                    mode === "income"
                        ? "bg-card shadow-sm text-success"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Income
            </button>
        </div>
    );

    const body = (
        <>
            {segment}
            {mode === "expense" ? (
                <ExpenseForm
                    addExpense={addExpense}
                    isLoading={isExpenseLoading}
                    categories={categories}
                    expenseRecords={expenseRecords}
                />
            ) : (
                <IncomeForm addIncome={addIncome} isLoading={isIncomeLoading} />
            )}
        </>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-h-[92vh] overflow-y-auto p-5"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Add transaction</SheetTitle>
                    </SheetHeader>
                    {body}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[370px] rounded-xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Add transaction</DialogTitle>
                </DialogHeader>
                {body}
            </DialogContent>
        </Dialog>
    );
};

export default TransactionAdder;
