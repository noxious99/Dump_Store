const Iou = require('../Schemas/iouSchema');


const insertIou = async (data) => {
    return Iou.create(data);
};

const findIousByUser = async (userId, filters = {}) => {
    const query = { userId };
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    return Iou.find(query).sort({ transactionDate: -1 }).lean({ virtuals: true });
};

const findIouByIdForUser = async (iouId, userId) => {
    return Iou.findOne({ _id: iouId, userId });
};

const updateIouForUser = async (iouId, userId, updateData) => {
    return Iou.findOneAndUpdate(
        { _id: iouId, userId },
        updateData,
        { new: true, runValidators: true }
    ).lean({ virtuals: true });
};

const deleteIouForUser = async (iouId, userId) => {
    return Iou.findOneAndDelete({ _id: iouId, userId });
};

/**
 * Aggregate outstanding balances for dashboard summary.
 * Returns: totals (by type, all still-owed) + per-counterparty net breakdown.
 */
const getOutstandingSummary = async (userId) => {
    return Iou.aggregate([
        {
            $match: {
                userId,
                status: { $in: ['pending', 'partial'] }
            }
        },
        {
            $project: {
                type: 1,
                counterpartyName: 1,
                remaining: { $max: [{ $subtract: ['$amount', { $ifNull: ['$amountPaid', 0] }] }, 0] }
            }
        },
        {
            $facet: {
                totals: [
                    { $group: { _id: '$type', amount: { $sum: '$remaining' } } }
                ],
                perPerson: [
                    {
                        $group: {
                            _id: '$counterpartyName',
                            // net = positive means they owe user (user lent)
                            //       negative means user owes them (user borrowed)
                            net: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$type', 'lent'] },
                                        '$remaining',
                                        { $multiply: ['$remaining', -1] }
                                    ]
                                }
                            }
                        }
                    },
                    { $sort: { net: -1 } }
                ],
                pending: [
                    { $count: 'value' }
                ]
            }
        }
    ]);
};


module.exports = {
    insertIou,
    findIousByUser,
    findIouByIdForUser,
    updateIouForUser,
    deleteIouForUser,
    getOutstandingSummary,
};
