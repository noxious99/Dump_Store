const { Goal } = require("../Schemas/goal/goalSchema");
const Task = require("../Schemas/goal/taskSchema");


// ── Goal ─────────────────────────────────────────────────

const insertGoal = async ({ title, userId, category, targetDate }) => {
    return Goal.create({ title, author: userId, category, targetDate });
};

const findGoalsByUserId = async (userId) => {
    return Goal.find({ author: userId })
        .sort({ createdAt: -1 })
        .populate('tasks')
        .lean();
};

const findGoalByIdForUser = async (goalId, userId) => {
    return Goal.findOne({ _id: goalId, author: userId })
        .populate('tasks')
        .lean();
};

const updateGoalForUser = async (goalId, userId, updateData) => {
    return Goal.findOneAndUpdate(
        { _id: goalId, author: userId },
        updateData,
        { new: true, runValidators: true }
    ).populate('tasks').lean();
};

const deleteGoalForUser = async (goalId, userId) => {
    return Goal.findOneAndDelete({ _id: goalId, author: userId });
};


// ── Task ─────────────────────────────────────────────────

const insertTask = async (taskData) => {
    const task = await Task.create(taskData);
    await Goal.findByIdAndUpdate(taskData.goalId, { $push: { tasks: task._id } });
    return task;
};

const findTaskByIdForUser = async (taskId, goalId, userId) => {
    const goal = await Goal.findOne({ _id: goalId, author: userId }).select('_id').lean();
    if (!goal) return null;
    return Task.findOne({ _id: taskId, goalId }).lean();
};

const findTasksByGoalForUser = async (goalId, userId) => {
    const goal = await Goal.findOne({ _id: goalId, author: userId }).select('_id').lean();
    if (!goal) return null;
    return Task.find({ goalId }).sort({ startDate: 1 }).lean();
};

const updateTask = async (taskId, updateData) => {
    return Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true }).lean();
};

const deleteTask = async (taskId, goalId) => {
    const task = await Task.findOneAndDelete({ _id: taskId, goalId });
    if (task) {
        await Goal.findByIdAndUpdate(goalId, { $pull: { tasks: taskId } });
    }
    return task;
};


module.exports = {
    insertGoal,
    findGoalsByUserId,
    findGoalByIdForUser,
    updateGoalForUser,
    deleteGoalForUser,
    insertTask,
    findTaskByIdForUser,
    findTasksByGoalForUser,
    updateTask,
    deleteTask,
};
