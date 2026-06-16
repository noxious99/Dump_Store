import type { ExpenseRecord } from "@/types/expenseTracker";

// A repeated (category, amount, note) combo offered as a one-tap log.
export type QuickChip = {
    key: string;
    categoryId: string;
    categoryName: string;
    amount: number;
    note: string;
    count: number;
    lastDate: string;
};

/**
 * Derive quick-add chips from a month's expense records: combos logged at least
 * `minCount` times, most frequent first (ties broken by most recent), capped at
 * `limit`. Shared by the expense form and the dashboard so both surface the
 * same one-tap repeats.
 */
export function computeQuickChips(
    records: ExpenseRecord[],
    { limit = 3, minCount = 2 }: { limit?: number; minCount?: number } = {}
): QuickChip[] {
    const map = new Map<string, QuickChip>();
    for (const r of records) {
        if (!r.category?._id) continue;
        const note = (r.note || "").trim();
        const key = `${r.category._id}|${r.amount}|${note.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) {
            existing.count += 1;
            if (r.date > existing.lastDate) existing.lastDate = r.date;
        } else {
            map.set(key, {
                key,
                categoryId: r.category._id,
                categoryName: r.category.name,
                amount: r.amount,
                note,
                count: 1,
                lastDate: r.date,
            });
        }
    }
    return [...map.values()]
        .filter((c) => c.count >= minCount)
        .sort((a, b) => b.count - a.count || b.lastDate.localeCompare(a.lastDate))
        .slice(0, limit);
}
