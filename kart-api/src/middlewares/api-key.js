const { createHttpError } = require("../utils/response");

const API_KEY = "apitest";

function apiKeyMiddleware(req, res, next) {
  const apiKey = req.header("api_key");
  if (!apiKey) {
    return next(createHttpError(401, "unauthorized", "Missing api_key header."));
  }

  if (apiKey !== API_KEY) {
    return next(createHttpError(403, "forbidden", "Invalid api_key."));
  }

  next();
}

module.exports = { apiKeyMiddleware };
