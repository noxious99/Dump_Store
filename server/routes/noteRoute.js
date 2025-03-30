const express = require("express");
const { addNote, getDailyNotes } = require("../controller/noteController");
const auth = require("../middleware/auth");
const route = express.Router();

route.post("/create", auth, addNote)
route.get("/dailynote", auth, getDailyNotes)

module.exports = route;