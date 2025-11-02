const express = require("express");
require('dotenv').config();
const User = require("../Schemas/userSchema");
const gravatar = require("gravatar");
const emailValidator = require("email-validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary.js");
const { upload } = require("../middleware/multerMiddleware.js");
const forgotPassword = require("../controller/authController.js");

const jwtKey = process.env.JWT_SECRET

const userLogin = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        let user;
        if (!identifier.includes('@')) {
            user = await User.findOne({ username: identifier });
        } else {
            user = await User.findOne({ email: identifier });
        }
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Invalid Credentials" });
            }
            const payload = {
                user: {
                    id: user.id,
                    username: user.username ?? "",
                    email: user.email,
                    name: user.name ?? "",
                    avatar: user.avatar ?? "",
                },
            };
            res.json({
                success: true,
                token: jwt.sign(
                    payload,
                    jwtKey,
                    { expiresIn: "24h" }
                ),
            });
        }
    } catch (error) {
        res.status(400).json({ msg: error });
    }
}


const userRegistration = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let userNameExist = await User.findOne({ username })
        if (userNameExist) {
            return res.status(400).json({ msg: "username already exist, try a different one" });
        }
        let validate = emailValidator.validate(email)
        if (!validate) {
            return res.status(400).json({ msg: "Invalid email address. Please provide a valid email." });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "A user with this email address already exists. Please use a different email." });
        } else {
            const avatar = gravatar.url(
                email,
                {
                    s: "200",
                    r: "pg",
                    d: "retro",
                },
                true
            );
            user = new User({
                username,
                email,
                avatar,
                password,
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        const token = jwt.sign(payload, jwtKey, { expiresIn: "10h" });
        res.send(token);
    } catch (error) {
        res.status(400).json({ msg: error });
    }
}


module.exports = { userLogin, userRegistration }
