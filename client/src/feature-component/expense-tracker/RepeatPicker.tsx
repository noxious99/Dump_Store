import React from "react";
import { Repeat } from "lucide-react";
import type { RecurringFrequency } from "@/types/expenseTracker";
import { WEEKDAY_ORDER } from "@/types/expenseTracker";

// Shared repeat control for the expense and income forms.
// Daily reveals 7 day toggles (Mon-first, all on by default) — deselecting
// Sat+Sun gives a Mon-Fri commute rule, M/W/F gives a gym rule, etc.

export type RepeatValue = {
    on: boolean;
    frequency: RecurringFrequency;
    days: number[]; // 0=Sun..6=Sat; only used when frequency === 'daily'
};

export const DEFAULT_REPEAT: RepeatValue = {
    on: false,
    frequency: "monthly",
    days: [0, 1, 2, 3, 4, 5, 6],
};

const OPTIONS: { value: RecurringFrequency; label: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "weekly", label: "Weekly" },
    { value: "daily", label: "Daily" },
];

type RepeatPickerProps = {
    value: RepeatValue;
    onChange: (value: RepeatValue) => void;
};

const RepeatPicker: React.FC<RepeatPickerProps> = ({ value, onChange }) => {
    const toggleDay = (day: number) => {
        const selected = value.days.includes(day);
        // never allow deselecting the last remaining day
        if (selected && value.days.length === 1) return;
        onChange({
            ...value,
            days: selected
                ? value.days.filter((d) => d !== day)
                : [...value.days, day],
        });
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange({ ...value, on: !value.on })}
                    aria-pressed={value.on}
                    className={`flex items-center gap-2 text-xs transition-colors py-1 px-1 ${
                        value.on ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Repeats</span>
                </button>
                {value.on && (
                    <div className="flex bg-grey-x100 rounded-md p-0.5">
                        {OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onChange({ ...value, frequency: opt.value })}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                                    value.frequency === opt.value
                                        ? "bg-card shadow-sm text-foreground"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {value.on && value.frequency === "daily" && (
                <div className="flex gap-1.5 pl-1">
                    {WEEKDAY_ORDER.map((day, i) => {
                        const selected = value.days.includes(day.value);
                        return (
                            <button
                                key={`${day.value}-${i}`}
                                type="button"
                                onClick={() => toggleDay(day.value)}
                                aria-pressed={selected}
                                className={`w-7 h-7 rounded-full text-[10px] font-bold transition-colors ${
                                    selected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-grey-x100 text-muted-foreground hover:bg-grey-x200"
                                }`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RepeatPicker;
