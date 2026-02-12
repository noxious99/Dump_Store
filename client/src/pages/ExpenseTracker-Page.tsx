import { Button } from '@/components/ui/button'
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import React, { useEffect, useState } from 'react'
import BalanceOverview from '@/feature-component/expense-tracker/BalanceOverview';
import ExpenseSummary from '@/feature-component/expense-tracker/ExpenseSummary';
import axiosInstance from '@/utils/axiosInstance';
import ExpenseAdder from '@/feature-component/expense-tracker/ExpenseAdder';
import type { ExpenseDetails, ExpensePayload, IncomePayload } from '@/types/expenseTracker';
import IncomeAdder from '@/feature-component/expense-tracker/IncomeAdder';
import { Loader2 } from 'lucide-react';
import BudgetSummary from '@/feature-component/expense-tracker/BudgetSummary';
import ExpenseRecordsList from '@/feature-component/expense-tracker/ExpenseRecordsList';
import SummaryCarousel from '@/feature-component/expense-tracker/SummaryCarousel';
import { toast } from 'sonner';

const ExpenseTracker: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [expenseCategoryList, setExpenseCategoryList] = useState([
        {
            _id: "",
            name: ""
        }
    ])
    const [expenseDetails, setExpenseDetails] = useState<ExpenseDetails>({
        expenseRecords: [],
        totalSpend: { amount: 0 },
        totalIncome: { amount: 0 },
        topCategory: [],
        monthlyBudget: {
            _id: '',
            amount: 0,
            alertThreshold: 0,
            allocationCount: 0
        }
    });
    const [isLoadingFetch, setIsLoadingFetch] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false);
    const [isExpenseAddingLoading, setIsExpenseAddingLoading] = useState(false)
    const [isIncomeAddingLoading, setIsIncomeAddingLoading] = useState(false)
    const [isHistoryMode, setIsHistoryMode] = useState(false)
    const balanceOverviewData = {
        totalIncome: expenseDetails.totalIncome?.amount || 0,
        totalExpense: expenseDetails.totalSpend?.amount || 0,
        walletBalance: (expenseDetails.totalIncome?.amount || 0) - (expenseDetails.totalSpend?.amount || 0)
    };

    const budgetSummary = {
        budgetId: expenseDetails.monthlyBudget?._id,
        amount: expenseDetails.monthlyBudget?.amount || 0,
        alertThreshold: expenseDetails.monthlyBudget?.alertThreshold || 80,
        remaining: (expenseDetails.monthlyBudget?.amount || 0) - (expenseDetails.totalSpend?.amount || 0),
        allocationCount: expenseDetails.monthlyBudget?.allocationCount
    };

    const topCategory = expenseDetails.topCategory || []
    const totalSpend = expenseDetails?.totalSpend?.amount || 0

    const handleMonthChange = (direction: "left" | "right") => {
        setCurrentDate(prevDate => {
            const newMonth = direction === "right" ? prevDate.getMonth() + 1 : prevDate.getMonth() - 1;
            return new Date(prevDate.getFullYear(), newMonth);
        });
    };

    const formattedMonth = currentDate.toLocaleString("default", { month: "short", year: "numeric" });

    const fetchExpenseDetails = async () => {
        setIsLoadingFetch(true);
        try {
            const dateParam = currentDate.toLocaleDateString("en-CA");
            const res = await axiosInstance.get("/v1/expenses/details", {
                params: { date: dateParam }
            });
            setExpenseDetails(res.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        } finally {
            setIsLoadingFetch(false);
        }
    };

    const handleAddExpense = async (val: ExpensePayload) => {
        setIsExpenseAddingLoading(true)
        try {
            const res = await axiosInstance.post("/v1/expenses", val);
            setExpenseDetails((prev) => ({
                ...prev,
                expenseRecords: [res.data, ...(prev.expenseRecords || [])],
                totalSpend: {
                    amount: (prev.totalSpend?.amount || 0) + res.data.amount,
                }
            }));
            setIsAddDialogOpen(false);
            await fetchExpenseDetails()
        } catch (error) {
            console.error("Error adding expense:", error);
            fetchExpenseDetails();
        } finally {
            setIsExpenseAddingLoading(false)
        }
    };

    const handleAddIncome = async (val: IncomePayload) => {
        setIsIncomeAddingLoading(true)
        try {
            const res = await axiosInstance.post("/v1/expenses/add-income", val);
            setExpenseDetails((prev) => ({
                ...prev,
                totalIncome: {
                    amount: (prev.totalIncome?.amount || 0) + res.data.amount
                }
            }));
            setIsAddIncomeDialogOpen(false);
        } catch (error) {
            console.error("Error adding income:", error);
            fetchExpenseDetails();
        } finally {
            setIsIncomeAddingLoading(false)
        }
    };

    const handleExpenseRecordDelete = async (expenseId: string) => {
        try {
            await axiosInstance.delete(`/v1/expenses/${expenseId}`);

            setExpenseDetails((prev) => ({
                ...prev,
                expenseRecords: prev.expenseRecords?.filter(
                    (expense) => expense._id !== expenseId
                ) || []
            }));

            toast.success("Record deleted");
        } catch (error) {
            console.error("Error deleting expense:", error);
            toast.error("Failed to delete record");
        }
    };

    const fetchCategoryList = async () => {
        try {
            const res = await axiosInstance.get("/v1/expenses/category")
            setExpenseCategoryList(res.data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleBudgetUpdate = async () => {
        await fetchExpenseDetails()
    }

    useEffect(() => {
        fetchCategoryList();
    }, [])

    useEffect(() => {
        const now = new Date()
        const runningDate = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const selectedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
        if (runningDate != selectedDate) {
            setIsHistoryMode(true)
        } else {
            setIsHistoryMode(false)
        }
        fetchExpenseDetails();
    }, [currentDate]);

    return (
        <>
            <div className='min-h-screen bg-grey-x100 relative'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
                    {/* Header */}
                    <header className='mb-6 sm:mb-8 animate-fade-up'>
                        <h1 className='text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1'>
                            <span className='text-gradient'>Expense Tracker</span>
                        </h1>
                        <p className='text-sm sm:text-base text-muted-foreground'>
                            Manage your income and expenses
                        </p>
                    </header>

                    {/* Month Navigation + Actions */}
                    <section className='mb-5 sm:mb-8 animate-fade-up'>
                        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4'>
                            <div className='flex items-center gap-2 sm:gap-3'>
                                <button
                                    onClick={() => handleMonthChange("left")}
                                    className='p-2 sm:p-2.5 hover:bg-grey-x200 rounded-lg transition-colors active:scale-[0.98]'
                                    disabled={isLoadingFetch}
                                >
                                    <FaCaretLeft className='text-primary text-lg sm:text-xl' />
                                </button>
                                <div className='px-3 sm:px-4 py-2 bg-card border border-border rounded-lg font-medium text-foreground min-w-[130px] text-center shadow-sm'>
                                    {formattedMonth}
                                </div>
                                <button
                                    onClick={() => handleMonthChange("right")}
                                    className='p-2 sm:p-2.5 hover:bg-grey-x200 rounded-lg transition-colors active:scale-[0.98]'
                                    disabled={isLoadingFetch}
                                >
                                    <FaCaretRight className='text-primary text-lg sm:text-xl' />
                                </button>
                            </div>
                            <div className='flex items-center gap-2 sm:gap-3'>
                                <Button
                                    className='flex-1 sm:flex-none bg-error hover:bg-error/90 text-white font-medium shadow-sm rounded-lg h-10 sm:h-11 active:scale-[0.98] transition-all duration-200'
                                    onClick={() => setIsAddDialogOpen(true)}
                                    disabled={isLoadingFetch || isHistoryMode}
                                >
                                    Add Expense
                                </Button>
                                <Button
                                    className='flex-1 sm:flex-none bg-success hover:bg-success/90 text-white font-medium shadow-sm rounded-lg h-10 sm:h-11 active:scale-[0.98] transition-all duration-200'
                                    onClick={() => setIsAddIncomeDialogOpen(true)}
                                    disabled={isLoadingFetch || isHistoryMode}
                                >
                                    Add Income
                                </Button>
                            </div>
                        </div>
                    </section>

                    {isLoadingFetch ? (
                        <div className='flex flex-col items-center justify-center py-12 gap-3'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            <p className='text-sm text-muted-foreground'>Loading your records...</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <section className='mb-5 sm:mb-8'>
                                <SummaryCarousel>
                                    <BalanceOverview balanceData={balanceOverviewData} />
                                    <BudgetSummary
                                        budgetSummary={budgetSummary}
                                        onBudgetUpdate={handleBudgetUpdate}
                                        categories={expenseCategoryList}
                                        historyMode={isHistoryMode}
                                    />
                                    <ExpenseSummary
                                        topCategory={topCategory}
                                        totalSpend={totalSpend}
                                    />
                                </SummaryCarousel>
                            </section>

                            {/* Records */}
                            <section className='pb-6 sm:pb-0'>
                                <ExpenseRecordsList
                                    expenseRecords={expenseDetails?.expenseRecords}
                                    onRecordDeleted={handleExpenseRecordDelete}
                                />
                            </section>
                        </>
                    )}
                </div>
            </div>

            <ExpenseAdder
                addExpense={handleAddExpense}
                handlePopupExpenseDialog={setIsAddDialogOpen}
                isOpen={isAddDialogOpen}
                isLoading={isExpenseAddingLoading}
                categories={expenseCategoryList}
            />
            <IncomeAdder
                addIncome={handleAddIncome}
                handlePopupIncomeDialog={setIsAddIncomeDialogOpen}
                isOpen={isAddIncomeDialogOpen}
                isLoading={isIncomeAddingLoading}
            />
        </>
    );
};

export default ExpenseTracker;