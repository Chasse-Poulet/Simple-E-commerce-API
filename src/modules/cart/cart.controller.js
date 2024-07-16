const CartService = require("./cart.service");
const OrderService = require("../orders/order.service");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY_TEST);

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const cart = await CartService.addToCart(userId, productId, quantity);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const cart = await CartService.removeFromCart(userId, productId);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { userId } = req.body;
    const { cart } = req;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cart.totalPrice * 100, // Amount in cents
      currency: "eur",
    });

    cart.paymentIntentId = paymentIntent.id;
    await cart.save();

    OrderService.createOrder(userId, cart, paymentIntent.id);

    res.status(200).json({ cart, client_secret: paymentIntent.client_secret });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
