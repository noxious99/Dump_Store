import React, { useEffect, useMemo, useState } from "react";
import { Delete, Loader2Icon, CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { ExpensePayload, ExpenseRecord } from "@/types/expenseTracker";
import { categoryEmojiMap } from "@/utils/constant";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCurrency } from "@/hooks/useCurrency";
import {
    recordCategoryUse,
    getCategoryRanking,
    getLastUsedCategory,
} from "@/utils/categoryUsage";

type Category = {
    _id: string;
    name: string;
}

type ExpenseAdderProps = {
    addExpense: (expenseData: ExpensePayload, opts?: { undoable?: boolean }) => Promise<ExpenseRecord | null>;
    handlePopupExpenseDialog: (isOpen: boolean) => void;
    isOpen: boolean;
    isLoading: boolean;
    categories: Category[];
    // Current month's records — source for the quick-add chips
    expenseRecords?: ExpenseRecord[];
}

// A repeated (category, amount, note) combo offered as a one-tap log
type QuickChip = {
    key: string;
    categoryId: string;
    categoryName: string;
    amount: number;
    note: string;
    count: number;
    lastDate: string;
}

const ExpenseAdder: React.FC<ExpenseAdderProps> = ({
    addExpense,
    handlePopupExpenseDialog,
    isOpen,
    isLoading,
    categories,
    expenseRecords = []
}) => {
    const [error, setError] = useState("");
    const [calcValue, setCalcValue] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [savingChipKey, setSavingChipKey] = useState<string | null>(null);
    const [addExpenseData, setAddExpenseData] = useState({
        amount: 0,
        categoryId: "",
        note: "",
    });
    const { symbol } = useCurrency();

    // Preselect the last-used category each time the sheet opens
    useEffect(() => {
        if (!isOpen) return;
        setAddExpenseData((d) => {
            if (d.categoryId) return d;
            const last = getLastUsedCategory();
            if (last && categories.some((c) => c._id === last)) {
                return { ...d, categoryId: last };
            }
            return d;
        });
    }, [isOpen, categories]);

    // Tiles ordered by personal usage; unused ones keep their default order
    const orderedCategories = useMemo(() => {
        const rank = new Map(getCategoryRanking().map((id, i) => [id, i]));
        return [...categories].sort(
            (a, b) => (rank.get(a._id) ?? Infinity) - (rank.get(b._id) ?? Infinity)
        );
        // re-rank on every open so fresh usage counts apply
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories, isOpen]);

    // Quick-add chips: combos logged ≥2 times this month, most frequent first.
    // History months never reach here — the adder only opens for the current month.
    const quickChips = useMemo<QuickChip[]>(() => {
        const map = new Map<string, QuickChip>();
        for (const r of expenseRecords) {
            if (!r.category?._id) continue;
            const note = (r.note || "").trim();
            const key = `${r.category._id}|${r.amount}|${note.toLowerCase()}`;
            const existing = map.get(key);
            if (existing) {
                existing.count += 1;
                if (r.date > existing.lastDate) existing.lastDate = r.date;
            } else {
                map.set(key, {
                    key,
                    categoryId: r.category._id,
                    categoryName: r.category.name,
                    amount: r.amount,
                    note,
                    count: 1,
                    lastDate: r.date,
                });
            }
        }
        return [...map.values()]
            .filter((c) => c.count >= 2)
            .sort((a, b) => b.count - a.count || b.lastDate.localeCompare(a.lastDate))
            .slice(0, 3);
    }, [expenseRecords]);

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


    const sanitizeInput = (input: string) => {
        const allowedChars = input.replace(/[^0-9+\-*/().\s]/g, '');
        const cleanVal = allowedChars.replace(/^[+\-*/]+|[+\-*/]+$/g, '');
        return cleanVal;
    };

    const evaluateExpression = (expression: string) => {
        try {
            const cleanVal = sanitizeInput(expression + "");
            const result = new Function('return ' + cleanVal)();
            return result;
        } catch (error) {
            console.error('Error evaluating expression:', error);
            return null;
        }
    };

    const handleDigitClick = (digit: string) => {
        if (digit === '=') {
            const result = evaluateExpression(calcValue);
            setCalcValue(result);
        } else if (digit === 'bksp') {
            if (calcValue.length === 0) return;
            const strVal = calcValue.toString();
            const newValue = strVal.slice(0, -1);
            setCalcValue(newValue);
        } else if (digit === '+' || digit === '-') {
            if (calcValue.length === 0) {
                setCalcValue(digit);
            } else {
                const lastChar = calcValue[calcValue.length - 1];
                if (lastChar !== '+' && lastChar !== '-') {
                    setCalcValue(calcValue + digit);
                } else {
                    const newValue = calcValue.slice(0, -1) + digit;
                    setCalcValue(newValue);
                }
            }
        } else {
            const newValue = calcValue + digit;
            setCalcValue(newValue);
        }
    };

    const handleSubmit = async () => {
        const result = await evaluateExpression(calcValue);
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
        const created = await addExpense(expenseData);
        if (!created) return; // failed — keep the form so nothing is lost

        recordCategoryUse(expenseData.categoryId);
        setAddExpenseData({
            amount: 0,
            categoryId: "",
            note: "",
        });
        setCalcValue("");
        setSelectedDate(undefined);
        setMoreOpen(false);
        setError("");
    };

    const numberButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const isMobile = useIsMobile();

    const formBody = (
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
                                    <span className="text-sm leading-none">
                                        {categoryEmojiMap[chip.categoryName] || "🔀"}
                                    </span>
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
                <div className="bg-muted rounded-lg p-2 min-h-[48px] flex items-center justify-start">
                    <p className="text-2xl font-mono text-foreground">
                        {calcValue.length === 0 ? '0' : calcValue}
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {numberButtons.map((num) => (
                        <Button
                            key={num}
                            type="button"
                            variant="outline"
                            className="h-10 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleDigitClick(num)}
                        >
                            {num}
                        </Button>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => handleDigitClick('bksp')}
                    >
                        <Delete className="h-5 w-5" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-lg font-medium hover:bg-chart-2 hover:text-white transition-colors"
                        onClick={() => handleDigitClick('+')}
                    >
                        +
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-lg font-medium hover:bg-chart-4 hover:text-white transition-colors col-span-2"
                        onClick={() => handleDigitClick('-')}
                    >
                        -
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-lg font-medium hover:bg-warning hover:text-white transition-colors col-span-2"
                        onClick={() => handleDigitClick('=')}
                    >
                        =
                    </Button>
                </div>
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
                                <span className="text-lg leading-none">
                                    {categoryEmojiMap[option.name] || "🔀"}
                                </span>
                                <span className="text-[10px] font-medium capitalize truncate w-full text-center text-foreground">
                                    {option.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {!moreOpen && !selectedDate ? (
                    <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                        + More options
                    </button>
                ) : (
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

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={handlePopupExpenseDialog}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-h-[92vh] overflow-y-auto p-5"
                >
                    <SheetHeader className="text-left mb-3">
                        <SheetTitle className="text-base font-extrabold text-foreground">
                            Add Expense
                        </SheetTitle>
                    </SheetHeader>
                    {formBody}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handlePopupExpenseDialog}>
            <DialogContent className="w-[370px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Add Expense</DialogTitle>
                </DialogHeader>
                {formBody}
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseAdder;