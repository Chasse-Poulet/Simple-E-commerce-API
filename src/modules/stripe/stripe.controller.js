const OrderService = require("../orders/order.service");
const CartService = require("../cart/cart.service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

const handlePaymentIntentSucceeded = async (res, intent) => {
  try {
    await OrderService.findOrderByPaymentIntentAndPay(intent.id);
    await CartService.findCartByPaymentIntentAndEmpty(intent.id);
  } catch (err) {
    console.error(err);
    res.status(400).end();
  }
};

exports.webhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_ENDPOINT_SECRET
    );
  } catch (err) {
    // invalid signature
    console.error(err);
    res.status(400).end();
    return;
  }

  let intent = null;
  switch (event.type) {
    case "payment_intent.succeeded":
      intent = event.data.object;
      await handlePaymentIntentSucceeded(res, intent);
      break;
  }

  res.status(200).end();
};
