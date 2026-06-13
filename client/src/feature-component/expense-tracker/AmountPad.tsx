import React from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shared calculator-style amount input used by both the expense and
// income forms so the two adder tabs keep an identical pattern.

const sanitizeInput = (input: string) => {
    const allowedChars = input.replace(/[^0-9+\-*/().\s]/g, '');
    const cleanVal = allowedChars.replace(/^[+\-*/]+|[+\-*/]+$/g, '');
    return cleanVal;
};

export const evaluateAmountExpression = (expression: string): number | null => {
    try {
        const cleanVal = sanitizeInput(expression + "");
        const result = new Function('return ' + cleanVal)();
        return typeof result === 'number' && isFinite(result) ? result : null;
    } catch (error) {
        console.error('Error evaluating expression:', error);
        return null;
    }
};

type AmountPadProps = {
    value: string;
    onChange: (value: string) => void;
};

const numberButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const AmountPad: React.FC<AmountPadProps> = ({ value, onChange }) => {
    const handleDigitClick = (digit: string) => {
        if (digit === '=') {
            const result = evaluateAmountExpression(value);
            onChange(result === null ? value : String(result));
        } else if (digit === 'bksp') {
            if (value.length === 0) return;
            onChange(value.toString().slice(0, -1));
        } else if (digit === '+' || digit === '-') {
            if (value.length === 0) {
                onChange(digit);
            } else {
                const lastChar = value[value.length - 1];
                if (lastChar !== '+' && lastChar !== '-') {
                    onChange(value + digit);
                } else {
                    onChange(value.slice(0, -1) + digit);
                }
            }
        } else {
            onChange(value + digit);
        }
    };

    return (
        <>
            <div className="bg-muted rounded-lg p-2 min-h-[48px] flex items-center justify-start">
                <p className="text-2xl font-mono text-foreground">
                    {value.length === 0 ? '0' : value}
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
        </>
    );
};

export default AmountPad;
