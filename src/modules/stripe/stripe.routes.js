const express = require("express");
const verifyStripeIp = require("../../middleware/verifyStripeIp.middleware");
const stripeController = require("./stripe.controller");

const router = express.Router();

router.post("/", verifyStripeIp, stripeController.webhook);

module.exports = router;
