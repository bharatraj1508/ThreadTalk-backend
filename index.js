require("dotenv").config();
require("./models/users");
require("./models/hash");
require("./models/answer");
require("./models/comment");
require("./models/question");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes/adminApi");
const authRoutes = require("./routes/authRoutes/auth");
const questionRoutes = require("./routes/questionRoutes/questionApi");

const app = express();

app.use(cors());

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// MongoDB connection URI
const mongoUri = process.env.MONGOURI;

// Connecting to MongoDB
mongoose.connect(mongoUri);

// Event handler for successful MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("Connected to mongo instance");
});

// Event handler for MongoDB connection error
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to mongo", err);
});

//registering admin routes
app.use("/api/admin", adminRoutes);

// registering auth routes
app.use("/auth", authRoutes);

// registering question routes
app.use("/api/questions", questionRoutes);

app.get("/", (req, res) => {
  res.status(200).send({ message: "ONLINE" });
});

// Starting the server
app.listen(3000, () => {
  console.log("listening on port 3000");
});
