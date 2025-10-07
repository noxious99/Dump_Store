import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { IncomePayload } from "@/types/expenseTracker";

interface IncomeAdderProps {
    addIncome: (incomeData: IncomePayload) => void;
    handlePopupIncomeDialog: (isOpen: boolean) => void;
    isOpen: boolean;
}

const IncomeAdder: React.FC<IncomeAdderProps> = ({
    addIncome,
    handlePopupIncomeDialog,
    isOpen
}) => {
    const [error, setError] = useState("");
    const [addIncomeData, setAddIncomeData] = useState({
        amount: 0,
        source: "",
        note: "",
    });

    const sourceOptions = [
        { value: "salary", label: "Salary", emoji: "💼" },
        { value: "freelance", label: "Freelance", emoji: "💻" },
        { value: "investment", label: "Investment", emoji: "📈" },
        { value: "rental", label: "Rental Income", emoji: "🏠" },
        { value: "gift", label: "Gift", emoji: "🎁" },
        { value: "bonus", label: "Bonus", emoji: "💰" },
        { value: "refund", label: "Refund", emoji: "↩️" },
        { value: "interest", label: "Interest", emoji: "🏦" },
        { value: "miscellaneous", label: "Miscellaneous", emoji: "🔀" },
    ];

    const handleSubmit = async () => {
        setError("");
        const incomeData = { ...addIncomeData };
        addIncome(incomeData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handlePopupIncomeDialog}>
            <DialogContent className="w-[370px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Add to Wallet</DialogTitle>
                </DialogHeader>
                {error && (
                    <Alert variant="destructive" className="py-2 px-3 border-red-200 bg-red-50">
                        <AlertDescription className="text-xs leading-tight text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="Add Amount"
                        className="h-12 bg-muted focus-visible:ring-ring"
                        value={addIncomeData.amount || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and decimal point
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                setError(""); // Clear error if valid
                                setAddIncomeData({
                                    ...addIncomeData,
                                    amount: parseFloat(value) || 0
                                });
                            } else {
                                setError("Please enter digits only");
                            }
                        }}
                    />
                    <Select
                        value={addIncomeData.source}
                        onValueChange={(value) =>
                            setAddIncomeData({ ...addIncomeData, source: value })
                        }
                    >
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span className="flex items-center gap-2">
                                        <span>{option.emoji}</span>
                                        <span>{option.label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="text"
                        placeholder="Add a note"
                        className="h-12 bg-muted focus-visible:ring-ring"
                        value={addIncomeData.note}
                        onChange={(e) => setAddIncomeData({ ...addIncomeData, note: e.target.value })}
                    />
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                        Add to Wallet
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default IncomeAdder;