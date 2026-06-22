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
    RecurringRulePayload,
} from "@/types/expenseTracker";

export type TransactionMode = "expense" | "income";

type TransactionAdderProps = {
    // null = closed; a mode = open on that tab
    openMode: TransactionMode | null;
    onClose: () => void;
    addExpense: (expenseData: ExpensePayload, opts?: { undoable?: boolean; skipRecurringPrompt?: boolean }) => Promise<ExpenseRecord | null>;
    addIncome: (incomeData: IncomePayload) => Promise<boolean | void> | void;
    isExpenseLoading: boolean;
    isIncomeLoading: boolean;
    categories: { _id: string; name: string }[];
    expenseRecords?: ExpenseRecord[];
    onCreateRecurringRule?: (payload: RecurringRulePayload) => Promise<void> | void;
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
    onCreateRecurringRule,
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

    // Active tab carries the app's primary indigo accent (matches the gradient
    // icon set), instead of the old red/green money-in/out cue.
    // mr-9 keeps the segmented control clear of the sheet/dialog close (X) button
    const segment = (
        <div className="flex bg-grey-x100 rounded-lg p-1 mb-3 mr-9">
            <button
                type="button"
                onClick={() => setMode("expense")}
                aria-pressed={mode === "expense"}
                className={`flex-1 h-9 rounded-md text-sm font-semibold transition-colors ${
                    mode === "expense"
                        ? "bg-card shadow-sm text-primary"
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
                        ? "bg-card shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                Income
            </button>
        </div>
    );

    const form =
        mode === "expense" ? (
            <ExpenseForm
                addExpense={addExpense}
                isLoading={isExpenseLoading}
                categories={categories}
                expenseRecords={expenseRecords}
                onCreateRecurringRule={onCreateRecurringRule}
            />
        ) : (
            <IncomeForm
                addIncome={addIncome}
                isLoading={isIncomeLoading}
                onCreateRecurringRule={onCreateRecurringRule}
            />
        );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
                {/* Fixed-height flex column: tabs pinned at the top, the form
                    fills the rest. The form docks its note + action to the
                    bottom edge, so both tabs share one height and the slack on
                    the shorter tab becomes breathing room above the action —
                    never a dead void below it. */}
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl h-[96vh] p-5 flex flex-col"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Add transaction</SheetTitle>
                    </SheetHeader>
                    {segment}
                    <div className="flex-1 min-h-0 overflow-y-auto px-1 -mx-1">
                        {form}
                    </div>
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
                {segment}
                {form}
            </DialogContent>
        </Dialog>
    );
};

export default TransactionAdder;
