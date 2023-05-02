if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const {
  Homework,
  User,
  ResetPasswd,
  UserType,
  Languages,
} = require("./models/shemas");
const connection = require("./services/db");
const sendEmail = require("./services/emailer");
const TypeCheck = require("./services/typeCheck");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./services/authcheck");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const settingsRoute = require("./routes/settings");
const eventRoute = require("./routes/event");

const app = express();

connection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/images", express.static("./assets/images"));

app.get("/", (req, res) => {
  res.send("Eventful - We make events easy!");
});

app.use("/auth", authRoute);

app.get("/whoami", checkAuthenticated, async (req, res) => {
  req.user.password = null;
  res.send(req.user);
});

app.use("/user", checkAuthenticated, userRoute);
app.use("/settings", checkAuthenticated, settingsRoute);
app.use("/event", checkAuthenticated, eventRoute);

app.use("*", (req, res) => {
  res.status(404).send();
});

app.listen(3000, () => {
  console.log("Eventful-backend is now running on Port: 3000");
});
