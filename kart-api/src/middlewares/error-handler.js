const { createHttpError, formatJsonError } = require("../utils/response");

function notFoundHandler(req, res) {
  res.status(404).json(formatJsonError(createHttpError(404, "not_found", "Route not found.")));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json(formatJsonError(createHttpError(400, "invalid_input", "Malformed JSON body.")));
  }

  if (err && err.status) {
    return res.status(err.status).json(formatJsonError(err));
  }

  console.error(err);
  res.status(500).json(createHttpError(500, "server_error", "An unexpected error occurred."));
}

module.exports = { notFoundHandler, errorHandler };
