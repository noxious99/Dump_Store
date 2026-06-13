const getMonthBoundaries = (dateVal) => {
    const startOfMonth = new Date(Date.UTC(
        dateVal.getUTCFullYear(),
        dateVal.getUTCMonth(),
        1,
        0, 0, 0, 0
    ));

    const endOfMonth = new Date(Date.UTC(
        dateVal.getUTCFullYear(),
        dateVal.getUTCMonth() + 1,
        0,
        23, 59, 59, 999
    ));

    return { startOfMonth, endOfMonth };
}

// UTC to stay consistent with getMonthBoundaries — otherwise a non-UTC
// server labels budgets in local time on write but looks them up in UTC on
// read, so budgets silently mismatch/duplicate near month boundaries.
const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
};

const getYear = (date) => {
    return date.getUTCFullYear().toString();
};

module.exports = { getMonthBoundaries, getMonthName, getYear };