const express = require("express");
const router = express.Router();
const Auth = require("../middleware/auth");
const goalController = require("../controller/goalController");

// Goal routes
router.post("/", Auth, goalController.createGoalHandler);
router.get("/", Auth, goalController.getAllGoalsHandler);
router.get("/:id", Auth, goalController.getGoalByIdHandler);
router.delete("/:id", Auth, goalController.deleteGoalHandler);

// Milestone routes
router.post("/:id/milestones", Auth, goalController.addMilestoneHandler);

// Task routes (to be implemented)
router.post("/:id/tasks", Auth);
router.get("/:id/tasks", Auth);
router.put("/:id/tasks/:taskId", Auth);
router.delete("/:id/tasks/:taskId", Auth);

module.exports = router;
