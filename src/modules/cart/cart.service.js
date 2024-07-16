const Cart = require("./cart.model");
const Product = require("../products/product.model");

exports.addToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found !");
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.productId.toString() === productId
  );
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: {
        productId: product._id,
        name: product.name,
        price: product.price,
      },
      quantity,
    });
  }

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  await cart.save();
  return cart;
};

exports.removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found !");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new Error("Product not found in cart !");
  }

  cart.items.splice(itemIndex, 1);

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  await cart.save();
  return cart;
};

exports.findCartByPaymentIntentAndEmpty = async (paymentIntentId) => {
  const cart = await Cart.findOne({ paymentIntentId });
  delete cart.items;
  await cart.save();
};
