const express = require("express");
const { addNote, getDailyNotes, deleteNote } = require("../controller/noteController");
const auth = require("../middleware/auth");
const route = express.Router();

route.post("/create", auth, addNote)
route.get("/dailynote", auth, getDailyNotes)
route.delete("/delete/:id", auth, deleteNote)

module.exports = route;