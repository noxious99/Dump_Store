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

module.exports = {getMonthBoundaries}