import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { IncomePayload, RecurringRulePayload } from "@/types/expenseTracker";
import { Loader2Icon } from "lucide-react";
import AmountPad, { evaluateAmountExpression } from "./AmountPad";
import RepeatPicker, { DEFAULT_REPEAT, type RepeatValue } from "./RepeatPicker";

interface IncomeFormProps {
    // Returns false when the save failed (so no recurring rule gets created)
    addIncome: (incomeData: IncomePayload) => Promise<boolean | void> | void;
    isLoading: boolean;
    onCreateRecurringRule?: (payload: RecurringRulePayload) => Promise<void> | void;
}

const sourceOptions = [
    { value: "salary", label: "Salary", emoji: "💼" },
    { value: "freelance", label: "Freelance", emoji: "💻" },
    { value: "investment", label: "Investment", emoji: "📈" },
    { value: "rental", label: "Rental", emoji: "🏠" },
    { value: "gift", label: "Gift", emoji: "🎁" },
    { value: "bonus", label: "Bonus", emoji: "💰" },
    { value: "refund", label: "Refund", emoji: "↩️" },
    { value: "interest", label: "Interest", emoji: "🏦" },
    { value: "miscellaneous", label: "Misc", emoji: "🔀" },
];

const IncomeForm: React.FC<IncomeFormProps> = ({
    addIncome,
    isLoading,
    onCreateRecurringRule
}) => {
    const [error, setError] = useState("");
    const [calcValue, setCalcValue] = useState("");
    const [source, setSource] = useState("");
    const [note, setNote] = useState("");
    const [repeat, setRepeat] = useState<RepeatValue>(DEFAULT_REPEAT);

    const handleSubmit = async () => {
        setError("");
        const result = evaluateAmountExpression(calcValue);
        if (result === null) {
            setError("Please enter a valid amount");
            return;
        }
        if (result <= 0) {
            setError("Please enter a value more than 0");
            return;
        }
        if (!source) {
            setError("Please select a source");
            return;
        }
        const ok = await addIncome({ amount: result, source, note });
        if (ok === false) return;
        if (repeat.on && onCreateRecurringRule) {
            await onCreateRecurringRule({
                kind: "income",
                amount: result,
                source,
                note,
                frequency: repeat.frequency,
                ...(repeat.frequency === "daily" ? { daysOfWeek: repeat.days } : {}),
            });
        }
        setRepeat(DEFAULT_REPEAT);
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
            <div className="space-y-2">
                <AmountPad value={calcValue} onChange={setCalcValue} />
                <div className="grid grid-cols-5 gap-1.5">
                    {sourceOptions.map((option) => {
                        const selected = source === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSource(option.value)}
                                aria-pressed={selected}
                                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-colors ${
                                    selected
                                        ? "bg-primary/5 ring-2 ring-primary"
                                        : "bg-grey-x100 hover:bg-grey-x200"
                                }`}
                            >
                                <span className="text-lg leading-none">{option.emoji}</span>
                                <span className="text-[10px] font-medium truncate w-full text-center text-foreground">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {onCreateRecurringRule && (
                    <RepeatPicker value={repeat} onChange={setRepeat} />
                )}
                <Input
                    type="text"
                    placeholder="Add a note"
                    className="h-12 bg-muted focus-visible:ring-ring"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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
                            Add to Wallet
                        </>
                    ) : (
                        <p>Add to Wallet</p>
                    )}
                </Button>
            </div>
        </>
    );
};

export default IncomeForm;
