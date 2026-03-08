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

const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long' });
};

const getYear = (date) => {
    return date.getFullYear().toString();
};

module.exports = { getMonthBoundaries, getMonthName, getYear };