const express = require("express");
const stripeController = require("./stripe.controller");

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  stripeController.webhook
);

module.exports = router;
