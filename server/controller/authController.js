// const sendResetEmail = require("../utils/mailerooConfig");
const sendResetEmail = require("../utils/resendConfig");
const jwt = require("jsonwebtoken");
const User = require("../Schemas/userSchema");

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // const token = jwt.sign("something", "talarchaabi", { expiresIn: "10h" });
        const resetToken = "hjgeyufgyhsgdfy";
        const resetLink = `https://dumpstore.vercel.app.com/reset-password?token=${resetToken}`;
        await sendResetEmail(email, resetLink);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = forgotPassword;
