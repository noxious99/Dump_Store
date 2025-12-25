require('dotenv').config();
const { loginUser, registerUser, getUserInfo } = require("../services/userService.js");


const userLogin = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const result = await loginUser(identifier, password)
        return res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ msg: error.message });
    }
}


const userRegistration = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const result = await registerUser(username, email, password)
        return res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}


const getProfileInfo = async (req, res) => {
    const userId = req.user.id
    try {
        const result = await getUserInfo(userId)
        res.json(result);
    } catch (err) {
        res.status(500).json({ msg: error.message });
    }
}


module.exports = { userLogin, userRegistration, getProfileInfo }
