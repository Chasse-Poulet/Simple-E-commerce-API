const express = require("express");
const { authenticateToken, authorizeAdmin } = require("../../middleware/auth");
const productController = require("./product.controller");

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(authenticateToken, authorizeAdmin, productController.createProduct);

router
  .route("/:productId")
  .get(productController.getProductById)
  .put(authenticateToken, authorizeAdmin, productController.updateProduct)
  .delete(authenticateToken, authorizeAdmin, productController.deleteProduct);

module.exports = router;
