const express = require("express");
const products = require("../../data/products");
const { createHttpError } = require("../utils/response");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(products);
});

router.get("/:productId", (req, res, next) => {
  const productId = Number(req.params.productId);

  if (!Number.isInteger(productId) || productId <= 0) {
    return next(createHttpError(400, "invalid_id", "Invalid productId supplied."));
  }

  const product = products.find((item) => Number(item.id) === productId);
  if (!product) {
    return next(createHttpError(404, "not_found", "Product not found."));
  }

  res.json(product);
});

module.exports = router;
