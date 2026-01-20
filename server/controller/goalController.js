const goalService = require("../services/goalService");


// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoalHandler = async (req, res) => {
  try {
    const { title, category, targetDate } = req.body;
    const userId = req.user.id;
    const result = await goalService.createGoal(title, userId, category, targetDate);
    return res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


// @desc    Get all goals of authenticated user
// @route   GET /api/goals
// @access  Private
const getAllGoalsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await goalService.getUserGoals(userId);
    return res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalByIdHandler = async (req, res) => {
  try {
    const goalId = req.params.id;
    const result = await goalService.getGoal(goalId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};


// @desc    Delete goal by ID
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoalHandler = async (req, res) => {
  try {
    const goalId = req.params.id;
    const result = await goalService.deleteGoal(goalId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};


// @desc    Add milestone to goal
// @route   POST /api/goals/:id/milestones
// @access  Private
const addMilestoneHandler = async (req, res) => {
  try {
    const { title } = req.body;
    const goalId = req.params.id;
    const result = await goalService.addMilestone(goalId, title);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

module.exports = {
  createGoalHandler,
  getAllGoalsHandler,
  getGoalByIdHandler,
  deleteGoalHandler,
  addMilestoneHandler
};
