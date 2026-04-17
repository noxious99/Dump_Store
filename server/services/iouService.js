const iouRepository = require('../db/iou');


// ── Internal helpers ─────────────────────────────────────

const computeStatus = (amount, amountPaid) => {
    if ((amountPaid || 0) <= 0) return 'pending';
    if (amountPaid >= amount) return 'settled';
    return 'partial';
};


// ── CRUD ─────────────────────────────────────────────────

const createIou = async (userId, payload) => {
    const { counterpartyName, type, amount } = payload;
    if (!counterpartyName || !type || !amount) {
        throw new Error("counterpartyName, type and amount are required");
    }
    if (amount <= 0) throw new Error("amount must be greater than 0");

    const data = {
        userId,
        counterpartyName: counterpartyName.trim(),
        counterpartyPhone: payload.counterpartyPhone,
        type,
        amount,
        amountPaid: 0,
        currency: payload.currency,
        transactionDate: payload.transactionDate,
        expectedPaybackDate: payload.expectedPaybackDate,
        note: payload.note,
        status: 'pending',
    };
    const iou = await iouRepository.insertIou(data);
    return iou.toJSON();
};

const getUserIous = async (userId, filters) => {
    const ious = await iouRepository.findIousByUser(userId, filters);
    return { ious };
};

const getIou = async (userId, iouId) => {
    const iou = await iouRepository.findIouByIdForUser(iouId, userId);
    if (!iou) throw new Error("IOU not found");
    return iou.toJSON();
};

const updateIou = async (userId, iouId, updates) => {
    // Fields safe to patch. Payment progression flows through settleIou instead.
    const allowed = [
        'counterpartyName', 'counterpartyPhone', 'type', 'amount', 'currency',
        'transactionDate', 'expectedPaybackDate', 'note',
    ];
    const payload = {};
    for (const key of allowed) {
        if (updates[key] !== undefined) payload[key] = updates[key];
    }
    if (payload.amount !== undefined && payload.amount <= 0) {
        throw new Error("amount must be greater than 0");
    }

    // If amount changed, re-evaluate status against the existing amountPaid.
    if (payload.amount !== undefined) {
        const existing = await iouRepository.findIouByIdForUser(iouId, userId);
        if (!existing) throw new Error("IOU not found");
        if (existing.status !== 'cancelled') {
            payload.status = computeStatus(payload.amount, existing.amountPaid);
            if (payload.status !== 'settled') payload.actualPaybackDate = null;
        }
    }

    const iou = await iouRepository.updateIouForUser(iouId, userId, payload);
    if (!iou) throw new Error("IOU not found");
    return iou;
};

const deleteIou = async (userId, iouId) => {
    const iou = await iouRepository.deleteIouForUser(iouId, userId);
    if (!iou) throw new Error("IOU not found");
    return { message: "Deleted successfully" };
};


// ── State transitions ────────────────────────────────────

/**
 * Record a (possibly partial) settlement.
 *  - paidAmount omitted → settle in full
 *  - paidAmount < remaining → partial, status = 'partial'
 *  - paidAmount >= remaining → status = 'settled', stamp actualPaybackDate
 */
const settleIou = async (userId, iouId, { paidAmount, paidOn } = {}) => {
    const existing = await iouRepository.findIouByIdForUser(iouId, userId);
    if (!existing) throw new Error("IOU not found");
    if (existing.status === 'cancelled') throw new Error("Cannot settle a cancelled IOU");
    if (existing.status === 'settled') throw new Error("IOU is already settled");

    const remaining = Math.max(existing.amount - (existing.amountPaid || 0), 0);
    const settleBy = paidAmount !== undefined ? Number(paidAmount) : remaining;
    if (settleBy <= 0) throw new Error("paidAmount must be greater than 0");

    const nextPaid = Math.min((existing.amountPaid || 0) + settleBy, existing.amount);
    const nextStatus = computeStatus(existing.amount, nextPaid);

    const update = { amountPaid: nextPaid, status: nextStatus };
    if (nextStatus === 'settled') {
        update.actualPaybackDate = paidOn ? new Date(paidOn) : new Date();
    }

    const iou = await iouRepository.updateIouForUser(iouId, userId, update);
    return iou;
};

const cancelIou = async (userId, iouId) => {
    const existing = await iouRepository.findIouByIdForUser(iouId, userId);
    if (!existing) throw new Error("IOU not found");
    if (existing.status === 'settled') throw new Error("Cannot cancel a settled IOU");

    return iouRepository.updateIouForUser(iouId, userId, { status: 'cancelled' });
};


// ── Dashboard summary ────────────────────────────────────

const getDashboardSummary = async (userId) => {
    const [agg] = await iouRepository.getOutstandingSummary(userId);
    const totals = agg?.totals ?? [];
    const perPerson = agg?.perPerson ?? [];

    const owedToYou = totals.find(t => t._id === 'lent')?.amount ?? 0;
    const youOwe = totals.find(t => t._id === 'borrowed')?.amount ?? 0;
    const pendingCount = agg?.pending?.[0]?.value ?? 0;

    const people = perPerson
        .filter(p => p.net !== 0)
        .slice(0, 5)
        .map(p => ({
            name: p._id,
            initial: (p._id?.[0] ?? '?').toUpperCase(),
            net: p.net,
        }));

    return {
        youOwe,
        owedToYou,
        net: owedToYou - youOwe,
        pendingCount,
        people,
    };
};


module.exports = {
    createIou,
    getUserIous,
    getIou,
    updateIou,
    deleteIou,
    settleIou,
    cancelIou,
    getDashboardSummary,
};
