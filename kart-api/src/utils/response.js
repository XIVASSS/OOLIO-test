function createHttpError(status, type, message) {
  const error = new Error(message);
  error.status = status;
  error.type = type;
  return error;
}

function formatJsonError(error) {
  return {
    code: error.status || 500,
    type: error.type || "server_error",
    message: error.message || "An unexpected error occurred."
  };
}

module.exports = { createHttpError, formatJsonError };
