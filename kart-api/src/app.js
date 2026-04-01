const express = require("express");
const fs = require("fs");
const path = require("path");
const productRoutes = require("./routes/product-routes");
const orderRoutes = require("./routes/order-routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error-handler");

const app = express();
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
const publicDir = path.join(__dirname, "..", "public");
const staticDir = fs.existsSync(frontendDist) ? frontendDist : publicDir;

app.use(express.json());
app.use(express.static(staticDir));
app.use("/product", productRoutes);
app.use("/order", orderRoutes);

const indexFile = path.join(staticDir, "index.html");
if (fs.existsSync(indexFile)) {
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    if (req.path.startsWith("/product") || req.path.startsWith("/order")) {
      return next();
    }
    res.sendFile(indexFile);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
