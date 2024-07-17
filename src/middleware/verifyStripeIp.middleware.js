const ipRangeCheck = require("ip-range-check");

const stripeIpRange = [
  "3.18.12.63",
  "3.130.192.231",
  "13.235.14.237",
  "13.235.122.149",
  "18.211.135.69",
  "35.154.171.200",
  "52.15.183.38",
  "54.88.130.119",
  "54.88.130.237",
  "54.187.174.169",
  "54.187.205.235",
  "54.187.216.72",
];

const verifyStripeIp = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (ipRangeCheck(ip, stripeIpRange)) {
    return next();
  } else {
    return res.status(403).send("Forbidden");
  }
};

module.exports = verifyStripeIp;
