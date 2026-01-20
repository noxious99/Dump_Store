const { Goal, MileStone } = require("../Schemas/goal/goalSchema");
const goalRepository = require("../db/goal");


/**
 * Create a new goal for a user
 */
const createGoal = async (title, userId, category, targetDate) => {
    const newGoal = await goalRepository.insertGoal(title, userId, category, targetDate);
    return {
        success: true,
        newGoal
    };
};


/**
 * Get all goals for a specific user
 */
const getUserGoals = async (userId) => {
    const goals = await goalRepository.findGoalsByUserId(userId);
    return {
        success: true,
        goals
    };
};


/**
 * Get a single goal by its ID
 */
const getGoal = async (goalId) => {
    const goal = await goalRepository.findGoalById(goalId);
    if (!goal) {
        throw new Error("Goal not found");
    }
    return {
        success: true,
        goal
    };
};


/**
 * Delete a goal by its ID
 */
const deleteGoal = async (goalId) => {
    const goal = await goalRepository.deleteGoalById(goalId);
    if (!goal) {
        throw new Error("Goal not found");
    }
    return {
        success: true,
        message: "Goal deleted successfully"
    };
};


/**
 * Add a milestone to an existing goal
 */
const addMilestone = async (goalId, milestoneTitle) => {
    const goal = await Goal.findById(goalId);
    if (!goal) {
        throw new Error("Goal not found");
    }

    const newMilestone = new MileStone({
        title: milestoneTitle,
        goalId: goalId
    });
    await newMilestone.save();

    goal.mileStone.push(newMilestone._id);
    await goal.save();

    return {
        success: true,
        milestone: newMilestone,
        goal
    };
};


module.exports = {
    createGoal,
    getUserGoals,
    getGoal,
    deleteGoal,
    addMilestone
};