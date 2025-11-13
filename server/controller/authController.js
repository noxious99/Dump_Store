const sendResetEmail = require("../utils/resendConfig");
const jwt = require("jsonwebtoken");
const User = require("../Schemas/userSchema");
const bcrypt = require("bcryptjs")


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User with this email dont exist!" });
        }

        const token = jwt.sign(
            { purpose: "passwordChange", email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const resetLink = `https://tracero.me/reset-password?token=${token}`;

        await sendResetEmail(email, resetLink);

        return res.status(200).json({
            message: "Password reset email sent",
        });
    } catch (error) {
        return res.status(400).json({ message: "Failed to send the email" });
    }
};


const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Password reset token and new password are required"
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // Verify token
        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                message: "Invalid or expired reset token. Please request a new password reset link"
            });
        }

        // Verify token purpose
        if (payload.purpose !== "passwordChange") {
            return res.status(403).json({
                message: "This token is not valid for password reset"
            });
        }

        // Find user
        const user = await User.findOne({ email: payload.email });
        if (!user) {
            return res.status(404).json({
                message: "User account not found."
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Your password has been reset successfully. You can now log in with your new password"
        });
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}


module.exports = { forgotPassword, resetPassword };
