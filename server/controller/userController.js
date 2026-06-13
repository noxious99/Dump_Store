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
        const { username, email, password, currency } = req.body;
        const result = await userService.registerUser(username, email, password, currency);
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


// @desc    Update profile fields (name, username, email)
// @route   PUT /api/v1/user/profile
// @access  Private
const updateProfileHandler = async (req, res) => {
    try {
        const { name, username, email } = req.body;
        if (name === undefined && username === undefined && email === undefined) {
            return res.status(400).json({ msg: "Nothing to update" });
        }
        const result = await userService.updateUserProfile(req.user.id, { name, username, email });
        return res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


// @desc    Get user preferences
// @route   GET /api/v1/user/preferences
// @access  Private
const getPreferencesHandler = async (req, res) => {
    try {
        const result = await userService.getUserPreferences(req.user.id);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


// @desc    Update user preferences (currency)
// @route   PUT /api/v1/user/preferences
// @access  Private
const updatePreferencesHandler = async (req, res) => {
    try {
        const { currency } = req.body;
        const result = await userService.updateUserPreferences(req.user.id, { currency });
        return res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};


// @desc    Change password
// @route   PUT /api/v1/user/password
// @access  Private
const updatePasswordHandler = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: "Current and new password are required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long" });
        }
        const result = await userService.changeUserPassword(req.user.id, currentPassword, newPassword);
        return res.status(200).json(result);
    } catch (error) {
        const status = error.message === "Current password is incorrect" ? 401 : 400;
        res.status(status).json({ msg: error.message });
    }
};


// @desc    Upload/replace profile avatar
// @route   POST /api/v1/user/avatar
// @access  Private
const updateAvatarHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "Avatar image file is required" });
        }
        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ msg: "Only image files are allowed" });
        }
        const result = await userService.updateUserAvatar(req.user.id, req.file.buffer);
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


module.exports = {
    loginHandler,
    registerHandler,
    getProfileHandler,
    updateProfileHandler,
    getPreferencesHandler,
    updatePreferencesHandler,
    updatePasswordHandler,
    updateAvatarHandler
};
