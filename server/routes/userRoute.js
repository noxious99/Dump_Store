const express = require("express");
const mongoose = require("mongoose");
const userRoute = express.Router();
const User = require("../Schemas/userSchema");
const gravatar = require("gravatar");
const emailValidator = require("email-validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary.js");
const { upload } = require("../middleware/multerMiddleware.js");

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

// User Login
userRoute.post("/login/", async (req, res) => {
  const { logBody, password } = req.body;

  try {
    let user;
    if(!logBody.includes('@')){
      user = await User.findOne({ username: logBody });
    } else {
      user = await User.findOne({ email: logBody });
    }
    if (!user) {
      return res.status(400).json({ err: "Invalid Credentials" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ err: "Invalid Credentials" });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      const token = await jwt.sign(payload, "talarchaabi", {
        expiresIn: "10h",
      });
      res.send(token);
    }
  } catch (err) {
    res.status(400).json({ err: err });
    console.log(err);
  }
});

// User Registration
userRoute.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let userNameExist = await User.findOne({ username })
    if(userNameExist) {
      return res.status(400).json({ err: "username already exist, try a different one" });
    }
    let validate = emailValidator.validate(email)
    if(!validate) {
      return res.status(400).json({ err: "Invalid email address. Please provide a valid email." });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ err: "A user with this email address already exists. Please use a different email." });
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
    const token = jwt.sign(payload, "talarchaabi", { expiresIn: "10h" });
    res.send(token);
  } catch (err) {
    res.status(400).json({ err: "Credential not matched" });
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

module.exports = userRoute;
