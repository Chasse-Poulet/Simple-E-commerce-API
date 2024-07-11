const express = require("express");
const { authenticateToken } = require("../../middleware/auth");
const cartController = require("./cart.controller");

const router = express.Router();

router.post("/add", authenticateToken, cartController.addToCart);
router.post("/remove", authenticateToken, cartController.removeFromCart);

module.exports = router;
