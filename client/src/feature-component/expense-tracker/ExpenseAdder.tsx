import React, { useState } from "react";
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
import { useIsMobile } from "@/hooks/useIsMobile";

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
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
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
        const expenseData: ExpensePayload = { ...addExpenseData, amount: result };
        if (selectedDate) {
            expenseData.date = selectedDate.toLocaleDateString("en-CA");
        }
        await addExpense(expenseData);

        setAddExpenseData({
            amount: 0,
            categoryId: "",
            note: "",
        });
        setCalcValue("");
        setSelectedDate(undefined);
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