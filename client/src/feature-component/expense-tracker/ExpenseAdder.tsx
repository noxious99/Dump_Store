import React, { useState } from "react";
import { Delete, Loader2Icon } from "lucide-react";
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
import type { ExpensePayload } from "@/types/expenseTracker";
import { categoryEmojiMap } from "@/utils/constant";

type Category = {
    _id: string;
    name: string;
}

type ExpenseAdderProps = {
    addExpense: (expenseData: ExpensePayload) => void;
    handlePopupExpenseDialog: (isOpen: boolean) => void;
    isOpen: boolean;
    isLoading: boolean;
    categories: Category[];
}

const ExpenseAdder: React.FC<ExpenseAdderProps> = ({
    addExpense,
    handlePopupExpenseDialog,
    isOpen,
    isLoading,
    categories
}) => {
    const [error, setError] = useState("");
    const [calcValue, setCalcValue] = useState("");
    const [addExpenseData, setAddExpenseData] = useState({
        amount: 0,
        categoryId: "",
        note: "",
    });


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
        const expenseData = { ...addExpenseData, amount: result };
        addExpense(expenseData);
        setError("");
    };

    const numberButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    return (
        <Dialog open={isOpen} onOpenChange={handlePopupExpenseDialog}>
            <DialogContent className="w-[370px] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Add Expense</DialogTitle>
                </DialogHeader>
                {error && (
                    <Alert variant="destructive" className="py-2 px-3 border-red-200 bg-red-50">
                        <AlertDescription className="text-xs leading-tight text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <div className="bg-muted rounded-lg p-2 min-h-[56px] flex items-center justify-start">
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
                                className="h-12 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleDigitClick(num)}
                            >
                                {num}
                            </Button>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => handleDigitClick('bksp')}
                        >
                            <Delete className="h-5 w-5" />
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 text-lg font-medium hover:bg-chart-2 hover:text-white transition-colors"
                            onClick={() => handleDigitClick('+')}
                        >
                            +
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 text-lg font-medium hover:bg-chart-4 hover:text-white transition-colors col-span-2"
                            onClick={() => handleDigitClick('-')}
                        >
                            -
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 text-lg font-medium hover:bg-warning hover:text-white transition-colors col-span-2"
                            onClick={() => handleDigitClick('=')}
                        >
                            =
                        </Button>
                    </div>
                    <Select
                        value={addExpenseData.categoryId}
                        onValueChange={(value) =>
                            setAddExpenseData({ ...addExpenseData, categoryId: value })
                        }
                    >
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((option) => (
                                <SelectItem key={option._id} value={option._id}>
                                    <span className="flex items-center gap-2">
                                        {categoryEmojiMap[option.name] || "🔀"}
                                        <span className="capitalize">{option.name}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseAdder;