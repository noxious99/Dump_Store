const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");

app = express();

// app.options( '*' , cors())

// app.use(cors({
//   allowedOrigin: ["*"]
// }));

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

const serverConnect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://noxious:saad1234@cluster0.ajiuz.mongodb.net/Project01"
    );
    console.log("DB connected");
    app.listen(8000, "0.0.0.0", () => {
      console.log("server running at 8000");
    });
  } catch (err) {
    console.log("DB connection error", err);
  }
};

serverConnect();

app.use("/api/user/", userRoute);
app.use("/api/post/", postRoute);
