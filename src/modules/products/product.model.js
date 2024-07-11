const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isDeleted: { type: Boolean, required: true, default: false },
});

const Product = model("Product", productSchema);
module.exports = Product;
