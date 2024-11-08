const express = require("express");
const goalRoute = express.Router();
const Auth = require("../middleware/auth");
const {
  PostGoal,
  PostObjective,
  GetGoalofUser,
  GetGoal,
} = require("../controller/goalController");

goalRoute.post("/", Auth, PostGoal);
goalRoute.get("/", Auth, GetGoalofUser);
goalRoute.get("/:id", GetGoal);
goalRoute.post("/:id", PostObjective);

module.exports = goalRoute;
