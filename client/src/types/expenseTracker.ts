export interface ExpenseRecord {
    _id: string;
    userId: string;
    amount: number;
    category: string;
    createdAt: string;
    updatedAt: string;
    note: string;
}

export interface ExpenseDetails {
    totalSpend?: {
        amount: number;
    };
    totalIncome?: {
        amount: number;
    };
    topCategory?: Array<{
        category: string;
        amount: number;
    }>;
    expenseRecords?: ExpenseRecord[];
}

export interface ExpensePayload {
    amount: number;
    category: string;
    note: string;
}

export interface IncomePayload {
    amount: number;
    source: string;
    note: string;
}