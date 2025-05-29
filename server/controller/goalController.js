const Goal = require("../Schemas/goal/goalSchema");

const PostGoal = async (req, res) => {
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
const GetGoalsOfUser = async (req, res) => {
  try {
    const id = req.user.id;
    const goals = await Goal.find({ author: id }).sort({ createdAt: -1 });
    return res.status(200).json(goals);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// get single goal
const GetGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const goal = await Goal.find({ _id: goalId });
    return res.status(200).json(goal);
  } catch (error) {
    return res.status(400).json(error);
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

module.exports = { PostGoal, PostObjective, GetGoalsOfUser, GetGoal };
