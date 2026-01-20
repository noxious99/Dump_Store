require('dotenv').config();
const userService = require("../services/userService.js");


// @desc    User login
// @route   POST /api/users/login
// @access  Public
const loginHandler = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const result = await userService.loginUser(identifier, password);
        return res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


// @desc    User registration
// @route   POST /api/users/register
// @access  Public
const registerHandler = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await userService.registerUser(username, email, password);
        return res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


// @desc    Get user profile information
// @route   GET /api/users/profile
// @access  Private
const getProfileHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await userService.getUserInfo(userId);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


module.exports = {
    loginHandler,
    registerHandler,
    getProfileHandler
};
