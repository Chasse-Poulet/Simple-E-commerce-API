const CartService = require("./cart.service");

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
