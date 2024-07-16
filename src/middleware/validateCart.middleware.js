const Cart = require("../modules/cart/cart.model");

const validateCart = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: { path: "products" },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty !" });
    }

    req.cart = cart;

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = validateCart;
