const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    console.log("111111111111")
    return res.status(400).json({ msg: "no user found!!" });
  }
  try {
    console.log("2222222222222222222222")
    let decoder = await jwt.verify(token, "talarchaabi");
    console.log(decoder)
    req.user = decoder.user;
    next();
  } catch (error) {
    res.status(400).json({ msg: "invalid request" });
  }
};
