const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');

app = express();
app.use(express.json());
app.use(cors())

const serverConnect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://noxious:saad1234@cluster0.ajiuz.mongodb.net/Project01"
    );
    console.log("DB connected");
    app.listen(8000, () => {
      console.log("server running at 8000");
    });
  } catch (err) {
    console.log("DB connection error", err);
  }
};

serverConnect();

app.use('/api/user/', userRoute);
app.use('/api/post/', postRoute);
