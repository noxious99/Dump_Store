const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const goalController = require("../controller/goalController");

// Goals
router.post("/", auth, goalController.createGoalHandler);
router.get("/", auth, goalController.getAllGoalsHandler);
router.get("/:id", auth, goalController.getGoalByIdHandler);
router.patch("/:id", auth, goalController.updateGoalHandler);
router.delete("/:id", auth, goalController.deleteGoalHandler);

// Tasks (nested under a goal)
router.post("/:id/tasks", auth, goalController.createTaskHandler);
router.get("/:id/tasks", auth, goalController.getGoalTasksHandler);
router.patch("/:id/tasks/:taskId", auth, goalController.updateTaskHandler);
router.post("/:id/tasks/:taskId/toggle", auth, goalController.toggleTaskCompletionHandler);
router.delete("/:id/tasks/:taskId", auth, goalController.deleteTaskHandler);

module.exports = router;
