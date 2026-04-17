const goalRepository = require("../db/goal");


// ── Internal helpers ─────────────────────────────────────

/**
 * Time-based progress: % of elapsed duration between createdAt and targetDate.
 * Used as a fallback signal until task-based progress or milestones come back online.
 */
const computeTimeProgress = (createdAt, targetDate) => {
    if (!createdAt || !targetDate) return 0;
    const start = new Date(createdAt).getTime();
    const end = new Date(targetDate).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
};

/**
 * Project a goal doc into the shape the dashboard consumes.
 * Keeps raw tasks available for detailed views.
 */
const projectGoal = (goal) => {
    const tasks = goal.tasks || [];
    const completedTasks = tasks.filter(t => (t.completedDates || []).length > 0).length;

    return {
        _id: goal._id,
        title: goal.title,
        category: goal.category,
        isCompleted: goal.isCompleted,
        targetDate: goal.targetDate,
        completionDate: goal.completionDate,
        createdAt: goal.createdAt,
        progress: {
            pct: goal.isCompleted ? 100 : computeTimeProgress(goal.createdAt, goal.targetDate),
            tasksTotal: tasks.length,
            tasksStarted: completedTasks,
        },
        tasks,
    };
};


// ── Goal ─────────────────────────────────────────────────

const createGoal = async (userId, { title, category, targetDate }) => {
    if (new Date(targetDate).getTime() <= Date.now()) {
        throw new Error("Target date must be in the future");
    }
    const goal = await goalRepository.insertGoal({ title, userId, category, targetDate });
    return projectGoal({ ...goal.toObject(), tasks: [] });
};

const getUserGoals = async (userId) => {
    const goals = await goalRepository.findGoalsByUserId(userId);
    return { goals: goals.map(projectGoal) };
};

const getGoal = async (userId, goalId) => {
    const goal = await goalRepository.findGoalByIdForUser(goalId, userId);
    if (!goal) throw new Error("Goal not found");
    return projectGoal(goal);
};

const updateGoal = async (userId, goalId, updates) => {
    const allowed = ['title', 'category', 'targetDate', 'isCompleted'];
    const payload = {};
    for (const key of allowed) {
        if (updates[key] !== undefined) payload[key] = updates[key];
    }
    if (payload.isCompleted === true) payload.completionDate = new Date();
    if (payload.isCompleted === false) payload.completionDate = null;

    const goal = await goalRepository.updateGoalForUser(goalId, userId, payload);
    if (!goal) throw new Error("Goal not found");
    return projectGoal(goal);
};

const deleteGoal = async (userId, goalId) => {
    const goal = await goalRepository.deleteGoalForUser(goalId, userId);
    if (!goal) throw new Error("Goal not found");
    return { message: "Deleted successfully" };
};


// ── Task ─────────────────────────────────────────────────

const createTask = async (userId, goalId, { title, type, startDate, repeatUntil }) => {
    const goal = await goalRepository.findGoalByIdForUser(goalId, userId);
    if (!goal) throw new Error("Goal not found");

    return goalRepository.insertTask({ title, goalId, type, startDate, repeatUntil });
};

const getGoalTasks = async (userId, goalId) => {
    const tasks = await goalRepository.findTasksByGoalForUser(goalId, userId);
    if (tasks === null) throw new Error("Goal not found");
    return { tasks };
};

const updateTask = async (userId, goalId, taskId, updates) => {
    const existing = await goalRepository.findTaskByIdForUser(taskId, goalId, userId);
    if (!existing) throw new Error("Task not found");

    const allowed = ['title', 'type', 'startDate', 'repeatUntil'];
    const payload = {};
    for (const key of allowed) {
        if (updates[key] !== undefined) payload[key] = updates[key];
    }
    return goalRepository.updateTask(taskId, payload);
};

const toggleTaskCompletion = async (userId, goalId, taskId, date) => {
    const task = await goalRepository.findTaskByIdForUser(taskId, goalId, userId);
    if (!task) throw new Error("Task not found");

    const target = new Date(date);
    target.setUTCHours(0, 0, 0, 0);
    const targetMs = target.getTime();

    const existing = (task.completedDates || []).map(d => {
        const dt = new Date(d);
        dt.setUTCHours(0, 0, 0, 0);
        return dt.getTime();
    });

    const isCompleted = existing.includes(targetMs);
    const nextDates = isCompleted
        ? existing.filter(ms => ms !== targetMs).map(ms => new Date(ms))
        : [...task.completedDates, target];

    return goalRepository.updateTask(taskId, { completedDates: nextDates });
};

const deleteTask = async (userId, goalId, taskId) => {
    const existing = await goalRepository.findTaskByIdForUser(taskId, goalId, userId);
    if (!existing) throw new Error("Task not found");

    await goalRepository.deleteTask(taskId, goalId);
    return { message: "Deleted successfully" };
};


module.exports = {
    createGoal,
    getUserGoals,
    getGoal,
    updateGoal,
    deleteGoal,
    createTask,
    getGoalTasks,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
};
