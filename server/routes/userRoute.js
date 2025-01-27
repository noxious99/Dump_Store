const express = require("express");
const userRoute = express.Router();
const User = require("../Schemas/userSchema");
const gravatar = require("gravatar");
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
      return res.status(400).json({ err: "invalid Credentials" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ err: "invalid Credentials" });
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
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ err: { mssg: "User Already Exist!!" } });
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
