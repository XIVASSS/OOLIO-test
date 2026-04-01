const crypto = require("crypto");
const express = require("express");
const products = require("../../data/products");
const { apiKeyMiddleware } = require("../middlewares/api-key");
const { createHttpError } = require("../utils/response");
const { normalizeOrderItems } = require("../validators/order-validator");
const { validateCoupon, roundTwo } = require("../services/coupon-service");

const router = express.Router();

router.post("/", apiKeyMiddleware, async (req, res, next) => {
  const { items, couponCode } = req.body;

  let normalizedItems;
  try {
    normalizedItems = normalizeOrderItems(items);
  } catch (error) {
    return next(error);
  }

  let orderItems;
  try {
    orderItems = normalizedItems.map((item) => {
      const product = products.find((prod) => prod.id === item.productId);
      if (!product) {
        throw createHttpError(400, "invalid_input", `Product ${item.productId} does not exist.`);
      }
      return { product, quantity: item.quantity };
    });
  } catch (error) {
    return next(error);
  }

  let couponDiscount = 0;
  if (couponCode !== undefined && couponCode !== null) {
    if (typeof couponCode !== "string") {
      return next(createHttpError(422, "validation_exception", "couponCode must be a string."));
    }

    const normalizedCoupon = couponCode.trim().toUpperCase();
    if (normalizedCoupon.length < 8 || normalizedCoupon.length > 10) {
      return next(createHttpError(422, "validation_exception", "Invalid coupon code length."));
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (normalizedCoupon === "HAPPYHOURS") {
      couponDiscount = roundTwo(subtotal * 0.18);
    } else if (normalizedCoupon === "BUYGETONE") {
      const lowestPrice = Math.min(...orderItems.map((item) => item.product.price));
      couponDiscount = roundTwo(lowestPrice);
    } else {
      const validCoupon = await validateCoupon(normalizedCoupon);
      if (!validCoupon) {
        return next(createHttpError(422, "validation_exception", "Invalid coupon code."));
      }
      couponDiscount = roundTwo(subtotal * 0.1);
    }
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = roundTwo(subtotal - couponDiscount);
  const productsInOrder = Array.from(
    orderItems.reduce((map, item) => map.set(item.product.id, item.product), new Map()).values()
  );

  res.json({
    id: crypto.randomUUID(),
    total,
    discounts: couponDiscount,
    items: orderItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    products: productsInOrder
  });
});

module.exports = router;
