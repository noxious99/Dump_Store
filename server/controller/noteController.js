const Note = require('../Schemas/noteSchema');
const User = require('../Schemas/userSchema');
const mongoose = require('mongoose');


const addNote = async (req, res) => {
    const { title, content, type } = req.body;
    const userId = req.user.id;

    try {
        if (userId === null) {
            return res.status(400).json({ err: 'User not found' });
        }
        user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ err: 'User not found' });
        }
        if (!title || !content) {
            return res.status(400).json({ err: 'Please fill in all fields' });
        }
        const newNote = new Note({ title, content, author: userId, type });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ err: err });
    }
}

const getDailyNotes = async (req, res) => {
    const userId = req.user.id;

    try {
        const notes = await Note.find({ author: userId, type: 'daily' })
            .sort({ createdAt: -1 });
        if (notes.length === 0) {
            return res.status(404).json({ err: "You haven't listed anything yet" });
        }
        res.json(notes);
    } catch (err) {
        res.status(500).json({ err: err });
    }
}

const deleteNote = async (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ err: 'Not authorized for this action' });
        }
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ err: 'Invalid note ID' });
        }
        const note = await Note.findByIdAndDelete(noteId);
        if (!note) {
            return res.status(404).json({ err: 'Note not found' });
        }
        res.status(200).json(note);
    }
    catch (err) {
        res.status(500).json({ err: err });
    }
}

module.exports = { addNote, getDailyNotes, deleteNote };    