const ProductService = require("./product.service");

exports.getAllProducts = async (req, res) => {
  const products = await ProductService.getAllProducts();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const productId = req.params.productId;
  const product = await ProductService.getProductById(productId);

  if (!product) {
    res.status(404).json({ error: "Product not found !" });
    return;
  }

  res.json(product);
};

exports.createProduct = async (req, res) => {
  const productData = { ...req.body };

  try {
    const product = await ProductService.createProduct(productData);
    res.status(201).json({ product, message: "Product added successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const updateData = { ...req.body };

  try {
    const product = await ProductService.updateProduct(productId, updateData);

    if (!product) {
      res.status(404).json({ error: "Product not found !" });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await ProductService.deleteProduct(productId);

    if (!product) {
      res.status(404).json({ error: "Product not found !" });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
