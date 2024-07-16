const Order = require("./order.model");

exports.createOrder = async (userId, cart, paymentIntentId) => {
  const order = new Order({
    user: userId,
    items: cart.items.map((item) => ({
      product: item.product.productId,
      quantity: item.quantity,
    })),
    totalPrice: cart.totalPrice,
    status: "Pending",
    paymentIntentId,
  });

  await order.save();
  return order;
};

exports.findOrderByPaymentIntentAndPay = async (paymentIntentId) => {
  const order = await Order.find({ status: "Pending", paymentIntentId });
  order.status = "Paid";
  await order.save();
};

exports.getAllOrdersByUserId = async (userId) => {
  return await Order.find({ user: userId });
};
