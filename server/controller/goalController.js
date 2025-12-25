const Goal = require("../Schemas/goal/goalSchema");


const createNewGoal = async (req, res) => {
  try {
    const { title, category, targetDate } = req.body;

    const newGoal = await new Goal({
      title: title,
      author: req.user.id,
      category: category,
      targetDate: targetDate
    });

    await newGoal.save();
    return res.status(201).json(newGoal);
  } catch (error) {
    return res.status(400).json(error);
  }
};


// get all goals of a user
const getGoalsOfUser = async (req, res) => {
  try {
    const id = req.user.id;
    const goals = await Goal.find({ author: id }).sort({ createdAt: -1 });
    return res.status(200).json(goals);
  } catch (error) {
    return res.status(400).json(error);
  }
};


// get single goal
const getGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await Goal.find({ _id: goalId });
    return res.status(200).json(goal);
  } catch (error) {
    return res.status(400).json(error);
  }
};


// delete goal
const deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await Goal.findByIdAndDelete(goalId);
    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }
    return res.status(200).json({ msg: "Goal deleted successfully" });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};


const PostObjective = async (req, res) => {
  try {
    const { title } = req.body;
    const id = req.params.id;

    const goal = await Goal.findById(id);

    await goal.objectives.push({ title, isDone: false });

    await goal.save();

    return res.status(200).json(goal);
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = { createNewGoal, getGoalsOfUser, getGoal, deleteGoal };
