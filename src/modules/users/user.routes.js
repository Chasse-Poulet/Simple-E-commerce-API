const express = require("express");
const {
  authenticateToken,
  authorizeSelfOrAdmin,
  authorizeAdmin,
} = require("../../middleware/auth.middleware");
const userController = require("./user.controller");

const router = express.Router();

router.get("/", authenticateToken, authorizeAdmin, userController.getAllUsers);
router.post("/signup", userController.signup);
router.post("/login", userController.login);

router
  .route("/:userId")
  .get(authenticateToken, authorizeSelfOrAdmin, userController.getUserById)
  .delete(
    authenticateToken,
    authorizeSelfOrAdmin,
    userController.deleteUserById
  );

module.exports = router;
