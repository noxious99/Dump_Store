export interface ExpenseRecord {
    _id: string;
    userId: string;
    amount: number;
    category: {
        _id: string,
        name: string
    };
    date: string;
    createdAt: string;
    updatedAt: string;
    note: string;
    // Present when the record was materialized from a recurring rule
    recurringRuleId?: string;
    // Server sets this on create when a similar expense existed last month
    recurringSuggestion?: boolean;
}

export interface ExpenseDetails {
    totalSpend?: {
        amount: number;
    };
    totalIncome?: {
        amount: number;
    };
    topCategory?: Array<{
        categoryId: string,
        name: string;
        amount: number;
    }>;
    expenseRecords?: ExpenseRecord[];
    monthlyBudget: {
        _id: string,
        amount: number,
        alertThreshold: number,
        allocationCount: number
    };
    // Lazy-materialization result for this fetch (skipped = beyond backfill cap)
    recurring?: {
        materialized: number;
        skipped: number;
    };
}

export interface ExpensePayload {
    amount: number;
    categoryId: string;
    note: string;
    date?: string;
}

export interface IncomePayload {
    amount: number;
    source: string;
    note: string;
}

export interface BudgetAllocation {
    _id: string;
    budgetId: string;
    categoryId: string;
    categoryName: string;
    allocatedAmount: number;
    spent: number;
    remaining: number;
    // Server-computed row for a category with spending but no saved
    // allocation; editing it creates the real allocation.
    isVirtual?: boolean;
}

export interface TopCategoryItem {
    categoryId: string;
    name: string;
    amount: number;
}

export interface CategoryOption {
    _id: string;
    name: string;
}

// 'weekdays' is legacy — new daily rules narrow days via daysOfWeek instead
export type RecurringFrequency = 'daily' | 'weekdays' | 'weekly' | 'monthly';

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
    monthly: 'Monthly',
    weekly: 'Weekly',
    weekdays: 'Mon–Fri',
    daily: 'Daily',
};

// Mon-first display order; values are JS weekday numbers (0=Sun..6=Sat)
export const WEEKDAY_ORDER: { value: number; label: string }[] = [
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'T' },
    { value: 5, label: 'F' },
    { value: 6, label: 'S' },
    { value: 0, label: 'S' },
];

export interface RecurringRulePayload {
    kind: 'expense' | 'income';
    amount: number;
    categoryId?: string;
    source?: string;
    note?: string;
    frequency: RecurringFrequency;
    anchorDate?: string; // YYYY-MM-DD; defaults to today on the server
    daysOfWeek?: number[]; // daily only; 0=Sun..6=Sat; omit = every day
}

export interface RecurringRule {
    _id: string;
    kind: 'expense' | 'income';
    amount: number;
    categoryId?: { _id: string; name: string } | null;
    source?: string;
    note?: string;
    frequency: RecurringFrequency;
    anchorDay: number;
    daysOfWeek?: number[];
    nextRunDate: string;
    isActive: boolean;
}