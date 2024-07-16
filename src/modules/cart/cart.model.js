const { Schema, model } = require("mongoose");

const cartItemSchema = new Schema({
  product: {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  quantity: { type: Number, required: true },
});

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
  totalPrice: { type: Number, required: true, default: 0 },
  paymentIntentId: { type: String },
});

const Cart = model("Cart", cartSchema);
module.exports = Cart;
