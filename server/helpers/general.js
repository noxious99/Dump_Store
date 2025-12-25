const jwt = require("jsonwebtoken");
require('dotenv').config();

const jwtKey = process.env.JWT_SECRET

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        jwtKey,
        { expiresIn: "24h" }
    )
}

module.exports = {
    generateToken
}