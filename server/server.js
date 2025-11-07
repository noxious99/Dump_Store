const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const goalRoute = require("./routes/goalRoute");
const expenseRoute = require("./routes/expenseRoute");
const noteRoute = require("./routes/noteRoute");
const healthRouter = require("./routes/healthRoute")

app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());


const api_prefix = process.env.API_PREFIX ?? "/api/v1";
// Api end-points
app.use(`${api_prefix}/user`, userRoute);
app.use(`${api_prefix}/posts`, postRoute);
app.use(`${api_prefix}/goals`, goalRoute);
app.use(`${api_prefix}/expenses`, expenseRoute);
app.use(`${api_prefix}/notes`, noteRoute);
app.use(`${api_prefix}/utils`, healthRouter);

// Test route
app.get(`${api_prefix}/test`, (req, res) => {
  res.json({ message: 'API is working', prefix: api_prefix });
});

// 404 handler for debugging
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method, 
    url: req.originalUrl,
  });
});


const PORT = process.env.PORT || 8000;
const DB_URI = process.env.MONGODB_URI
const serverConnect = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("DB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running at ${PORT}`);
    });
  } catch (err) {
    console.log("DB connection error", err);
  }
};

serverConnect();