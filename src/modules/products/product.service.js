const Product = require("./product.model");

exports.getAllProducts = async () => {
  return await Product.find().where({ isDeleted: false });
};

exports.getProductById = async (id) => {
  return await Product.findById(id).where({ isDeleted: false });
};

exports.createProduct = async (productData) => {
  const product = new Product(productData);
  return product.save();
};

exports.updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deleteProduct = async (id) => {
  return await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};
