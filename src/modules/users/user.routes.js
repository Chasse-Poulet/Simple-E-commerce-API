const express = require("express");
const auth = require("../../middleware/auth");
const userController = require("./user.controller");

const router = express.Router();

router.get("/", userController.getAllUsers);
router.post("/signup", userController.signup);
router.post("/login", userController.login);

router
  .route("/:userId")
  .get(auth, userController.getUserById)
  .delete(auth, userController.deleteUserById);

module.exports = router;
