const express = require("express");
const {
  authenticateToken,
  authorizeSelfOrAdmin,
} = require("../../middleware/auth.middleware");
const orderController = require("./order.controller");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  authenticateToken,
  authorizeSelfOrAdmin,
  orderController.getAllOrdersByUserId
);

module.exports = router;
