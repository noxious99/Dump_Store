const express = require("express");
const goalRoute = express.Router();
const Auth = require("../middleware/auth");
const {
  PostGoal,
  PostObjective,
  GetGoalsOfUser,
  GetGoal,
} = require("../controller/goalController");

goalRoute.post("/create", Auth, PostGoal);
goalRoute.get("/goals", Auth, GetGoalsOfUser);
goalRoute.get("/goal/:id", GetGoal);
goalRoute.post("/:id", PostObjective);

module.exports = goalRoute;
