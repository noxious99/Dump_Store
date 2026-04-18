import React, { useState } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { IncomePayload } from "@/types/expenseTracker";
import { Loader2Icon } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface IncomeAdderProps {
    addIncome: (incomeData: IncomePayload) => void;
    handlePopupIncomeDialog: (isOpen: boolean) => void;
    isOpen: boolean;
    isLoading: boolean
}

const IncomeAdder: React.FC<IncomeAdderProps> = ({
    addIncome,
    handlePopupIncomeDialog,
    isOpen,
    isLoading
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
            <div className="space-y-2">
                <Input
                    type="text"
                    placeholder="Add Amount"
                    className="h-12 bg-muted focus-visible:ring-ring"
                    value={addIncomeData.amount || ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setError("");
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

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={handlePopupIncomeDialog}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-h-[92vh] overflow-y-auto p-5"
                >
                    <SheetHeader className="text-left mb-3">
                        <SheetTitle className="text-base font-extrabold text-foreground">
                            Add to Wallet
                        </SheetTitle>
                    </SheetHeader>
                    {formBody}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handlePopupIncomeDialog}>
            <DialogContent className="w-[370px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Add to Wallet</DialogTitle>
                </DialogHeader>
                {formBody}
            </DialogContent>
        </Dialog>
    );
};

export default IncomeAdder;