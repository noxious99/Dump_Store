const { Goal } = require("../Schemas/goal/goalSchema");


/**
 * Insert a new goal into the database
 * @param {String} title - Goal title
 * @param {String} userId - User ID (author)
 * @param {String} category - Goal category (longTerm/shortTerm)
 * @param {Date} targetDate - Target completion date
 * @returns {Promise<Object>} Created goal document
 */
const insertGoal = async (title, userId, category, targetDate) => {
    const newGoal = new Goal({
        title: title,
        author: userId,
        category: category,
        targetDate: targetDate
    });
    await newGoal.save();
    return newGoal;
};


/**
 * Find a single goal by ID with populated references
 * @param {String} goalId - Goal ID
 * @returns {Promise<Object|null>} Goal document or null
 */
const findGoalById = async (goalId) => {
    const goal = await Goal.findById(goalId)
        .populate('tasks')
        .populate('mileStone');
    return goal;
};


/**
 * Find all goals for a specific user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Array of goal documents
 */
const findGoalsByUserId = async (userId) => {
    const goals = await Goal.find({ author: userId })
        .sort({ createdAt: -1 })
        .populate('tasks')
        .populate('mileStone');
    return goals;
};


/**
 * Delete a goal by ID
 * @param {String} goalId - Goal ID
 * @returns {Promise<Object|null>} Deleted goal document or null
 */
const deleteGoalById = async (goalId) => {
    const goal = await Goal.findByIdAndDelete(goalId);
    return goal;
};


/**
 * Update goal completion status
 * @param {String} goalId - Goal ID
 * @param {Boolean} isCompleted - Completion status
 * @returns {Promise<Object|null>} Updated goal document or null
 */
const updateGoalCompletion = async (goalId, isCompleted) => {
    const updateData = { isCompleted };
    if (isCompleted) {
        updateData.completionDate = new Date();
    }
    const goal = await Goal.findByIdAndUpdate(
        goalId,
        updateData,
        { new: true }
    );
    return goal;
};


module.exports = {
    insertGoal,
    findGoalById,
    findGoalsByUserId,
    deleteGoalById,
    updateGoalCompletion
};
