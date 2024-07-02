const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserService = require("./user.service");
const auth = require("../../middleware/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  let users = await UserService.getAllUsers();

  if (!users) {
    res.status(404).json({ error: "Users not found !" });
    return;
  }

  res.json(users);
});

router.post("/signup", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);

  const user = {
    email: req.body.email,
    password: hash,
    username: req.body.username,
  };

  UserService.signup(user)
    .then(() => {
      res.status(201).json({ message: "User added successfully." });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

router.post("/login", async (req, res) => {
  UserService.getUserByEmail(req.body.email)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "User not found !" });
        return;
      }

      bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          res.status(401).json({ error: "Incorrect password !" });
          return;
        }

        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
          expiresIn: "24h",
        });

        res.status(200).json({ userId: user._id, token });
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

router
  .route("/:userId")
  .get(auth, async (req, res) => {
    const userId = req.params.userId;
    const user = await UserService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found !" });
      return;
    }

    res.json(user);
  })
  .delete(auth, async (req, res) => {
    const userId = req.params.userId;
    const user = await UserService.deleteUser(userId);

    if (!user) {
      res.status(404).json({ error: "Could not delete user : not found !" });
      return;
    }

    res.json(user);
  });

module.exports = router;
