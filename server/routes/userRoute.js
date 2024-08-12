const express = require("express");
const userRoute = express.Router();
const User = require("../Schemas/userSchema");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");


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
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ err: "invalid credentials" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ err: "invalid credentials" });
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
        password
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

userRoute.delete("/", (req, res) => {
  res.send("user delete route");
});

module.exports = userRoute;
