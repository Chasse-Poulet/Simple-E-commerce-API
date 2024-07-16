const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    required: true,
    default: "Pending",
    enum: ["Pending", "Paid", "Shipped", "Delivered"],
  },
  createdAt: { type: Date, default: Date.now },
  paymentIntentId: { type: String },
});

const Order = model("Order", orderSchema);
module.exports = Order;
