const express = require("express");
require('dotenv').config();
const router = express.Router();
const User = require("../Schemas/userSchema");
const auth = require("../middleware/auth");
const upload = require("../middleware/multerMiddlewareV2.js");
const authController = require("../controller/authController.js");
const userController = require("../controller/userController.js");

// Authentication routes
router.post("/login", userController.loginHandler);
router.post("/register", userController.registerHandler);

// Profile routes
router.get("/profile", auth, userController.getProfileHandler);
router.put("/profile", auth, userController.updateProfileHandler);
router.post("/avatar", auth, upload.single("avatar"), userController.updateAvatarHandler);

// Preferences routes
router.get("/preferences", auth, userController.getPreferencesHandler);
router.put("/preferences", auth, userController.updatePreferencesHandler);

// Password routes
router.put("/password", auth, userController.updatePasswordHandler);
router.post("/password/forgot", authController.forgotPassword);
router.post("/password/reset", authController.resetPassword);

// Auth verification
router.get("/auth", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

module.exports = router;
