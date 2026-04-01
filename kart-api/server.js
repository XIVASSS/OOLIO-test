const app = require("./src/app");
const { ensureCouponFilesAvailable } = require("./src/services/coupon-service");

const PORT = parseInt(process.env.PORT, 10) || 5050;

async function startServer() {
  try {
    await ensureCouponFilesAvailable();
    console.log("Coupon files are available.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error.message || error);
    process.exit(1);
  }
}

startServer();
