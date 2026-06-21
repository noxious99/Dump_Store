import React, { useEffect, useMemo, useState } from "react";
import { Loader2Icon, CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AmountPad, { evaluateAmountExpression } from "./AmountPad";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { ExpensePayload, ExpenseRecord, RecurringRulePayload } from "@/types/expenseTracker";
import RepeatPicker, { DEFAULT_REPEAT, type RepeatValue } from "./RepeatPicker";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useCurrency } from "@/hooks/useCurrency";
import {
    recordCategoryUse,
    getCategoryRanking,
    getLastUsedCategory,
} from "@/utils/categoryUsage";
import { computeQuickChips, type QuickChip } from "@/utils/quickChips";

type Category = {
    _id: string;
    name: string;
}

type ExpenseFormProps = {
    addExpense: (expenseData: ExpensePayload, opts?: { undoable?: boolean; skipRecurringPrompt?: boolean }) => Promise<ExpenseRecord | null>;
    isLoading: boolean;
    categories: Category[];
    // Current month's records — source for the quick-add chips
    expenseRecords?: ExpenseRecord[];
    // When provided, the "repeats" toggle appears in More options
    onCreateRecurringRule?: (payload: RecurringRulePayload) => Promise<void> | void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
    addExpense,
    isLoading,
    categories,
    expenseRecords = [],
    onCreateRecurringRule
}) => {
    const [error, setError] = useState("");
    const [calcValue, setCalcValue] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [repeat, setRepeat] = useState<RepeatValue>(DEFAULT_REPEAT);
    const [savingChipKey, setSavingChipKey] = useState<string | null>(null);
    const [addExpenseData, setAddExpenseData] = useState({
        amount: 0,
        categoryId: "",
        note: "",
    });
    const { symbol } = useCurrency();

    // Preselect the last-used category (form mounts fresh each time the adder opens)
    useEffect(() => {
        setAddExpenseData((d) => {
            if (d.categoryId) return d;
            const last = getLastUsedCategory();
            if (last && categories.some((c) => c._id === last)) {
                return { ...d, categoryId: last };
            }
            return d;
        });
    }, [categories]);

    // Tiles ordered by personal usage; unused ones keep their default order
    const orderedCategories = useMemo(() => {
        const rank = new Map(getCategoryRanking().map((id, i) => [id, i]));
        return [...categories].sort(
            (a, b) => (rank.get(a._id) ?? Infinity) - (rank.get(b._id) ?? Infinity)
        );
    }, [categories]);

    // Quick-add chips: combos logged ≥2 times this month, most frequent first.
    // History months never reach here — the adder only opens for the current month.
    const quickChips = useMemo<QuickChip[]>(
        () => computeQuickChips(expenseRecords),
        [expenseRecords]
    );

    const handleChipSave = async (chip: QuickChip) => {
        if (savingChipKey || isLoading) return;
        setSavingChipKey(chip.key);
        const created = await addExpense(
            { amount: chip.amount, categoryId: chip.categoryId, note: chip.note },
            { undoable: true }
        );
        if (created) recordCategoryUse(chip.categoryId);
        setSavingChipKey(null);
    };

    const handleSubmit = async () => {
        const result = evaluateAmountExpression(calcValue);
        setError("")
        if (result === undefined || result === null) {
            setError("Please enter a valid amount");
            return;
        }
        if (result <= 0) {
            setError("Please enter a value more than 0");
            return;
        }
        if (addExpenseData.categoryId === "") {
            setError("Please select a category");
            return;
        }
        const expenseData: ExpensePayload = { ...addExpenseData, amount: result };
        if (selectedDate) {
            expenseData.date = selectedDate.toLocaleDateString("en-CA");
        }
        // The user is already creating a rule via the toggle — don't let the
        // server's "make it automatic?" suggestion double-prompt them
        const created = await addExpense(expenseData, { skipRecurringPrompt: repeat.on });
        if (!created) return; // failed — keep the form so nothing is lost

        recordCategoryUse(expenseData.categoryId);
        if (repeat.on && onCreateRecurringRule) {
            await onCreateRecurringRule({
                kind: "expense",
                amount: result,
                categoryId: expenseData.categoryId,
                note: expenseData.note,
                frequency: repeat.frequency,
                anchorDate: expenseData.date,
                ...(repeat.frequency === "daily" ? { daysOfWeek: repeat.days } : {}),
            });
        }
        setAddExpenseData({
            amount: 0,
            categoryId: "",
            note: "",
        });
        setCalcValue("");
        setSelectedDate(undefined);
        setMoreOpen(false);
        setRepeat(DEFAULT_REPEAT);
        setError("");
    };

    return (
        <>
            {error && (
                <Alert variant="destructive" className="py-2 px-3 border-red-200 bg-red-50">
                    <AlertDescription className="text-xs leading-tight text-red-800">
                        {error}
                    </AlertDescription>
                </Alert>
            )}
            {quickChips.length > 0 && (
                <div className="mb-2 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Quick add
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-0.5">
                        {quickChips.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() => handleChipSave(chip)}
                                disabled={savingChipKey !== null || isLoading}
                                className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-grey-x100 hover:bg-grey-x200 transition-colors disabled:opacity-60 active:scale-95"
                            >
                                {savingChipKey === chip.key ? (
                                    <Loader2Icon className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                ) : (
                                    <CategoryIcon name={chip.categoryName} size={20} />
                                )}
                                <span className="text-sm font-semibold text-foreground">
                                    {symbol}{chip.amount.toLocaleString()}
                                </span>
                                {chip.note && (
                                    <span className="text-xs text-muted-foreground max-w-[72px] truncate">
                                        {chip.note}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="space-y-2">
                <AmountPad value={calcValue} onChange={setCalcValue} />
                <div className="grid grid-cols-5 gap-1.5">
                    {orderedCategories.map((option) => {
                        const selected = addExpenseData.categoryId === option._id;
                        return (
                            <button
                                key={option._id}
                                type="button"
                                onClick={() =>
                                    setAddExpenseData({ ...addExpenseData, categoryId: option._id })
                                }
                                aria-pressed={selected}
                                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-colors ${
                                    selected
                                        ? "bg-primary/5 ring-2 ring-primary"
                                        : "bg-grey-x100 hover:bg-grey-x200"
                                }`}
                            >
                                <CategoryIcon name={option.name} size={20} />
                                <span className="text-[10px] font-medium capitalize truncate w-full text-center text-foreground">
                                    {option.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {!moreOpen && !selectedDate && !repeat.on ? (
                    <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                        + More options
                    </button>
                ) : (
                <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-1"
                            >
                                <CalendarIcon className="w-3.5 h-3.5" />
                                <span>
                                    {selectedDate
                                        ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                        : "Add to a previous date"
                                    }
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center" sideOffset={8}>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => { setSelectedDate(date); setDatePopoverOpen(false); }}
                                disabled={{ after: new Date() }}
                                defaultMonth={selectedDate || new Date()}
                                classNames={{
                                    root: "w-[300px]",
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {selectedDate && (
                        <button
                            type="button"
                            className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                            onClick={() => setSelectedDate(undefined)}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                {onCreateRecurringRule && (
                    <RepeatPicker value={repeat} onChange={setRepeat} />
                )}
                </div>
                )}
                <Input
                    type="text"
                    placeholder="Add a note "
                    className="h-12 bg-muted focus-visible:ring-ring"
                    value={addExpenseData.note}
                    onChange={(e) => setAddExpenseData({ ...addExpenseData, note: e.target.value })}
                />
                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2Icon className="animate-spin mr-2" />
                            Add Expense
                        </>
                    ) : (
                        <p>Add Expense</p>
                    )}
                </Button>
            </div>
        </>
    );
};

export default ExpenseForm;
