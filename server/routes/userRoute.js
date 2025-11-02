const express = require("express");
require('dotenv-flow').config();
const userRoute = express.Router();
const User = require("../Schemas/userSchema");
const auth = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary.js");
const { upload } = require("../middleware/multerMiddleware.js");
const forgotPassword = require("../controller/authController.js");

const {userLogin, userRegistration} = require("../controller/userController.js")

// User Login
userRoute.post("/login", userLogin)
  

// User Registration
userRoute.post("/register", userRegistration);


// auth middleware
userRoute.get("/auth", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

//profile info fetch
userRoute.get("/profileinfo", auth, async (req, res) => {
  try {
    const userInfo = await User.findOne({_id: req.user.id}).select("username email avatar date _id");
    if (!userInfo) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(userInfo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


userRoute.get("/search", async (req, res) => {
  try {
    const buddyName = req.query.buddy;
    const buddies = await User.find({
      username: { $regex: `^${buddyName}`, $options: "i" },
    });
    res.status(200).json(buddies);
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

userRoute.put("/update/:id", upload.single("avatar"), async (req, res) => {
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

// update user patch

userRoute.patch("/update", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if(!user) {
      return res.status(400).json({err: "user not found"})
    }
    const {email, username} = req.body
    const updateUser = await User.findByIdAndUpdate(req.user.id, {email, username}, {new: true})
    res.json(updateUser);
  }
  catch (err) {
    res.status(400).json({ err: err });
  }
} )

userRoute.get("/allUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

userRoute.delete("/", (req, res) => {
  res.send("user delete route");
});

userRoute.post("/forgotpassword", forgotPassword)
module.exports = userRoute;
