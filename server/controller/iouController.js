const iouService = require('../services/iouService');

const statusFromError = (error) => {
    if (error.message.includes('not found')) return 404;
    return 400;
};


/**
 * @desc    Create an IOU
 * @route   POST /api/v1/iou
 * @access  Private
 */
const createIouHandler = async (req, res) => {
    try {
        const iou = await iouService.createIou(req.user.id, req.body);
        return res.status(201).json({ iou });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

/**
 * @desc    List IOUs (optional filters: status, type)
 * @route   GET /api/v1/iou
 * @access  Private
 */
const getIousHandler = async (req, res) => {
    try {
        const { status, type } = req.query;
        const data = await iouService.getUserIous(req.user.id, { status, type });
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Dashboard summary (owed-to-user, user-owes, net, top counterparties)
 * @route   GET /api/v1/iou/summary
 * @access  Private
 */
const getSummaryHandler = async (req, res) => {
    try {
        const summary = await iouService.getDashboardSummary(req.user.id);
        return res.status(200).json(summary);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Get a single IOU
 * @route   GET /api/v1/iou/:id
 * @access  Private
 */
const getIouByIdHandler = async (req, res) => {
    try {
        const iou = await iouService.getIou(req.user.id, req.params.id);
        return res.status(200).json({ iou });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Update editable IOU fields
 * @route   PATCH /api/v1/iou/:id
 * @access  Private
 */
const updateIouHandler = async (req, res) => {
    try {
        const iou = await iouService.updateIou(req.user.id, req.params.id, req.body);
        return res.status(200).json({ iou });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Record a settlement (partial or full)
 * @route   POST /api/v1/iou/:id/settle
 * @access  Private
 */
const settleIouHandler = async (req, res) => {
    try {
        const { paidAmount, paidOn } = req.body;
        const iou = await iouService.settleIou(req.user.id, req.params.id, { paidAmount, paidOn });
        return res.status(200).json({ iou });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Cancel an IOU (e.g. written off / voided)
 * @route   POST /api/v1/iou/:id/cancel
 * @access  Private
 */
const cancelIouHandler = async (req, res) => {
    try {
        const iou = await iouService.cancelIou(req.user.id, req.params.id);
        return res.status(200).json({ iou });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Delete an IOU record
 * @route   DELETE /api/v1/iou/:id
 * @access  Private
 */
const deleteIouHandler = async (req, res) => {
    try {
        const result = await iouService.deleteIou(req.user.id, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};


module.exports = {
    createIouHandler,
    getIousHandler,
    getSummaryHandler,
    getIouByIdHandler,
    updateIouHandler,
    settleIouHandler,
    cancelIouHandler,
    deleteIouHandler,
};
