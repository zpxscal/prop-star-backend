if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cookieParser = require("cookie-parser");

const connection = require("./services/db");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./services/authcheck");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const settingsRoute = require("./routes/settings");
const itemRoute = require("./routes/items");

const app = express();

connection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/images", express.static("./assets/images"));

app.get("/", (req, res) => {
  res.send("Prop-Star - Backend!");
});
app.get("/api", (req, res) => {
  res.send("Prop-Star - API!");
});

app.use("/auth", authRoute);

app.get("/whoami", checkAuthenticated, async (req, res) => {
  req.user.password = null;
  res.send(req.user);
});

app.use("/user", checkAuthenticated, userRoute);
app.use("/settings", checkAuthenticated, settingsRoute);
app.use("/items", checkAuthenticated, itemRoute);

app.use("*", (req, res) => {
  res.status(404).send();
});

app.listen(3000, () => {
  console.log("Eventful-backend is now running on Port: 3000");
});
