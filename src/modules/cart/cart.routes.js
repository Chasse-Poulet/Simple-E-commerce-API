const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const verifyUser = require("../../middleware/verifyUser.middleware");
const cartController = require("./cart.controller");

const router = express.Router();

router.post("/add", authenticateToken, verifyUser, cartController.addToCart);
router.post(
  "/remove",
  authenticateToken,
  verifyUser,
  cartController.removeFromCart
);

module.exports = router;
