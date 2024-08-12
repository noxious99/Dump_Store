const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(400).json({ err: "no user found!!" });
  }
  try {
    let decoder = await jwt.verify(token, "talarchaabi");
    req.user = decoder.user;
    next();
  } catch (err) {
    res.status(400).json({ err: "invalid request" });
  }
};
