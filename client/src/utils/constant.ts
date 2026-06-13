export const categoryEmojiMap: Record<string, string> = {
    travel: "🚗",
    food: "🍔",
    rent: "🏠",
    utility: "💡",
    groceries: "🛒",
    entertainment: "🎬",
    subscriptions: "📺",
    clothing: "👕",
    health: "💊",
    miscellaneous: "🔀",
};

export const categoryOptions = [
    { value: "travel", label: "Travel", emoji: "🚗" },
    { value: "food", label: "Food", emoji: "🍔" },
    { value: "rent", label: "Rent", emoji: "🏠" },
    { value: "utility", label: "Utility", emoji: "💡" },
    { value: "groceries", label: "Groceries", emoji: "🛒" },
    { value: "entertainment", label: "Entertainment", emoji: "🎬" },
    { value: "subscriptions", label: "Subscriptions", emoji: "📺" },
    { value: "clothing", label: "Clothing", emoji: "👕" },
    { value: "health", label: "Health", emoji: "💊" },
    { value: "miscellaneous", label: "Miscellaneous", emoji: "🔀" },
];

export const incomeSourceOptions = [
    { value: "salary", label: "Salary", emoji: "💼" },
    { value: "freelance", label: "Freelance", emoji: "💻" },
    { value: "investment", label: "Investment", emoji: "📈" },
    { value: "rental", label: "Rental", emoji: "🏠" },
    { value: "gift", label: "Gift", emoji: "🎁" },
    { value: "bonus", label: "Bonus", emoji: "💰" },
    { value: "refund", label: "Refund", emoji: "↩️" },
    { value: "interest", label: "Interest", emoji: "🏦" },
    { value: "miscellaneous", label: "Misc", emoji: "🔀" },
];

export const incomeSourceEmojiMap: Record<string, string> = Object.fromEntries(
    incomeSourceOptions.map((o) => [o.value, o.emoji])
);

export const categoryMap = {
  travel: { label: "Travel", emoji: "🚗" },
  food: { label: "Food", emoji: "🍔" },
  rent: { label: "Rent", emoji: "🏠" },
  utility: { label: "Utility", emoji: "💡" },
  groceries: { label: "Groceries", emoji: "🛒" },
  entertainment: { label: "Entertainment", emoji: "🎬" },
  subscriptions: { label: "Subscriptions", emoji: "📺" },
  clothing: { label: "Clothing", emoji: "👕" },
  health: { label: "Health", emoji: "💊" },
  miscellaneous: { label: "Miscellaneous", emoji: "🔀" },
};