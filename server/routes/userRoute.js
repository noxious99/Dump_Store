const express = require("express");
require('dotenv').config();
const router = express.Router();
const User = require("../Schemas/userSchema");
const auth = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary.js");
const { upload } = require("../middleware/multerMiddleware.js");
const authController = require("../controller/authController.js");
const userController = require("../controller/userController.js");

// Authentication routes
router.post("/login", userController.loginHandler);
router.post("/register", userController.registerHandler);

// Profile routes
router.get("/profile", auth, userController.getProfileHandler);


// Password routes
router.post("/password/forgot", authController.forgotPassword);
router.post("/password/reset", authController.resetPassword);

// Auth verification
router.get("/auth", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

// Update user with avatar upload
router.put("/update/:id", upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    let avatar;

    const avatarFile = req.file;

    if (avatarFile) {
      const cloudinaryResponse = await cloudinary.uploadOnCloudinary(
        avatarFile.path
      );
      if (!cloudinaryResponse) {
        return res
          .status(500)
          .json({ err: { mssg: "Failed to upload image to Cloudinary" } });
      }
      avatar = cloudinaryResponse.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          username,
          email,
          ...(avatar && { avatar }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ err: { mssg: "User Not Found" } });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ err: error.message });
  }
});

// Update user (patch)
router.patch("/update", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ err: "user not found" });
    }
    const { email, username } = req.body;
    const updateUser = await User.findByIdAndUpdate(req.user.id, { email, username }, { new: true });
    res.json(updateUser);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

// Get all users
router.get("/allUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

// Delete user (placeholder)
router.delete("/", (req, res) => {
  res.send("user delete route");
});

module.exports = router;
