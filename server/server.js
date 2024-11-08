const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");
const goalRoute = require("./routes/goalRoute");

app = express();

app.use(
  cors({
    origin: "*",
  })
);

// app.use(cors({
//   origin: "*", // Allows all origins
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
//   allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"], // Allowed headers
//   credentials: true, // Allow credentials (cookies, authorization headers)
//   preflightContinue: false, // Pass the CORS preflight response to the next handler
// }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 8000;
const serverConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running at ${PORT}`);
    });
  } catch (err) {
    console.log("DB connection error", err);
  }
};

serverConnect();

app.use("/api/user/", userRoute);
app.use("/api/post/", postRoute);
app.use("/api/goal/", goalRoute);
