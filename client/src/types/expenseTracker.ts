export interface ExpenseRecord {
    _id: string;
    userId: string;
    amount: number;
    category: {
        _id: string,
        name: string
    };
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
    }
}

export interface BalanceData {
    totalIncome: number,
    totalExpense: number,
    walletBalance: number
}

export interface ExpensePayload {
    amount: number;
    categoryId: string;
    note: string;
}

export interface IncomePayload {
    amount: number;
    source: string;
    note: string;
}