const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Config import
const db = require("./config/mongo");

// Routers import
const userRouter = require("./components/users/api");

const app = express();
const port = 3000;

// Config setup
db();

app.use(express.json());
app.use(cors());

// Routes setup
app.use("/auth", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
