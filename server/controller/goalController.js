const goalService = require("../services/goalService");

const statusFromError = (error) => error.message.includes('not found') ? 404 : 400;


// ── Goal ─────────────────────────────────────────────────

/**
 * @desc    Create a new goal
 * @route   POST /api/v1/goals
 * @access  Private
 */
const createGoalHandler = async (req, res) => {
    try {
        const { title, category, targetDate } = req.body;
        if (!title || !targetDate) {
            return res.status(400).json({ msg: "Title and targetDate are required" });
        }
        const goal = await goalService.createGoal(req.user.id, { title, category, targetDate });
        return res.status(201).json({ goal });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

/**
 * @desc    Get all goals for the authenticated user
 * @route   GET /api/v1/goals
 * @access  Private
 */
const getAllGoalsHandler = async (req, res) => {
    try {
        const data = await goalService.getUserGoals(req.user.id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

/**
 * @desc    Get a single goal by ID
 * @route   GET /api/v1/goals/:id
 * @access  Private
 */
const getGoalByIdHandler = async (req, res) => {
    try {
        const goal = await goalService.getGoal(req.user.id, req.params.id);
        return res.status(200).json({ goal });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Update a goal (title, category, targetDate, completion status)
 * @route   PATCH /api/v1/goals/:id
 * @access  Private
 */
const updateGoalHandler = async (req, res) => {
    try {
        const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body);
        return res.status(200).json({ goal });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Delete a goal (cascades via repository)
 * @route   DELETE /api/v1/goals/:id
 * @access  Private
 */
const deleteGoalHandler = async (req, res) => {
    try {
        const result = await goalService.deleteGoal(req.user.id, req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};


// ── Task ─────────────────────────────────────────────────

/**
 * @desc    Create a task under a goal
 * @route   POST /api/v1/goals/:id/tasks
 * @access  Private
 */
const createTaskHandler = async (req, res) => {
    try {
        const { title, type, startDate, repeatUntil } = req.body;
        if (!title || !type || !startDate || !repeatUntil) {
            return res.status(400).json({ msg: "title, type, startDate and repeatUntil are required" });
        }
        const task = await goalService.createTask(req.user.id, req.params.id, {
            title, type, startDate, repeatUntil,
        });
        return res.status(201).json({ task });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    List tasks belonging to a goal
 * @route   GET /api/v1/goals/:id/tasks
 * @access  Private
 */
const getGoalTasksHandler = async (req, res) => {
    try {
        const data = await goalService.getGoalTasks(req.user.id, req.params.id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Update a task's metadata
 * @route   PATCH /api/v1/goals/:id/tasks/:taskId
 * @access  Private
 */
const updateTaskHandler = async (req, res) => {
    try {
        const task = await goalService.updateTask(
            req.user.id, req.params.id, req.params.taskId, req.body
        );
        return res.status(200).json({ task });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Toggle a task's completion for a given date
 * @route   POST /api/v1/goals/:id/tasks/:taskId/toggle
 * @access  Private
 */
const toggleTaskCompletionHandler = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(400).json({ msg: "date is required" });

        const task = await goalService.toggleTaskCompletion(
            req.user.id, req.params.id, req.params.taskId, date
        );
        return res.status(200).json({ task });
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/v1/goals/:id/tasks/:taskId
 * @access  Private
 */
const deleteTaskHandler = async (req, res) => {
    try {
        const result = await goalService.deleteTask(
            req.user.id, req.params.id, req.params.taskId
        );
        return res.status(200).json(result);
    } catch (error) {
        return res.status(statusFromError(error)).json({ msg: error.message });
    }
};


module.exports = {
    createGoalHandler,
    getAllGoalsHandler,
    getGoalByIdHandler,
    updateGoalHandler,
    deleteGoalHandler,
    createTaskHandler,
    getGoalTasksHandler,
    updateTaskHandler,
    toggleTaskCompletionHandler,
    deleteTaskHandler,
};
