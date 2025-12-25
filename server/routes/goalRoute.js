const express = require("express");
const goalRoute = express.Router();
const Auth = require("../middleware/auth");
const {
  createNewGoal,
  getGoalsOfUser,
  getGoal,
  deleteGoal,
} = require("../controller/goalController");

goalRoute.post("/", Auth, createNewGoal);
goalRoute.get("/", Auth, getGoalsOfUser);
goalRoute.get("/:id", getGoal);
goalRoute.delete('/:id', Auth, deleteGoal)
goalRoute.post("/task", Auth);
goalRoute.get("/tasks/:id", Auth);
goalRoute.put("/tasks/:id", Auth);
goalRoute.delete("/tasks/:id", Auth);

module.exports = goalRoute;
