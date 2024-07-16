const OrderService = require("./order.service");

exports.getAllOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await OrderService.getAllOrdersByUserId(userId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
