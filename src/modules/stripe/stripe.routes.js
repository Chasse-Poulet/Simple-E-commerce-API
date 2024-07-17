const express = require("express");
const stripeController = require("./stripe.controller");

const router = express.Router();

router.post("/", stripeController.webhook);

module.exports = router;
