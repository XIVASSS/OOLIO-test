const { createHttpError } = require("../utils/response");

function normalizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, "invalid_input", "Request body must include a non-empty items array.");
  }

  return items.map((item, index) => {
    if (!item || typeof item.productId !== "string" || item.productId.trim() === "") {
      throw createHttpError(400, "invalid_input", `items[${index}].productId is required and must be a string.`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw createHttpError(400, "invalid_input", `items[${index}].quantity must be a positive integer.`);
    }

    return {
      productId: item.productId.trim(),
      quantity: item.quantity
    };
  });
}

module.exports = { normalizeOrderItems };
