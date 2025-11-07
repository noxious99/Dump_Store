const express = require("express")
const healthRouter = express.Router();

const {keepServerWarm} = require("../controller/healthController")

healthRouter.get("/_keepwarm", keepServerWarm);

module.exports = healthRouter