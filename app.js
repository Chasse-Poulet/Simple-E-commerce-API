require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Routers import
const userRouter = require("./src/modules/users/user.routes");

const app = express();

app.use(express.json());
app.use(cors());

// Routes setup
app.use("/auth", userRouter);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

module.exports = app;
