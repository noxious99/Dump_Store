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