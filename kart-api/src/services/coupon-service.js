const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const COUPON_FILES = ["couponbase1.gz", "couponbase2.gz", "couponbase3.gz"];
const COUPON_DIR = resolveCouponDir();
const couponCache = new Map();

function resolveCouponDir() {
  const candidates = [
    path.resolve(__dirname, "..", "..", "..", "backend-challenge"),
    path.resolve(__dirname, "..", "..", "backend-challenge"),
    path.resolve(__dirname, "..", "..")
  ];

  return candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
}

function isCouponFormatValid(code) {
  return typeof code === "string" && code.trim().length >= 8 && code.trim().length <= 10;
}

function tokenizeLine(line) {
  return line
    .split(/[^A-Za-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 8 && token.length <= 10);
}

function streamContainsCoupon(filePath, code) {
  return new Promise((resolve, reject) => {
    const normalizedCode = code.trim();
    const stream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
    let buffer = "";
    let resolved = false;

    const finish = (result) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (tokenizeLine(line).includes(normalizedCode)) {
          stream.destroy();
          finish(true);
          return;
        }
      }
    });

    stream.on("end", () => {
      if (resolved) return;
      const lastLineTokens = tokenizeLine(buffer);
      finish(lastLineTokens.includes(normalizedCode));
    });

    stream.on("close", () => {
      if (!resolved) {
        const lastLineTokens = tokenizeLine(buffer);
        finish(lastLineTokens.includes(normalizedCode));
      }
    });

    stream.on("error", (error) => {
      if (!resolved) {
        reject(error);
      }
    });
  });
}

async function validateCoupon(code) {
  if (!isCouponFormatValid(code)) {
    return false;
  }

  const normalized = code.trim();
  if (couponCache.has(normalized)) {
    return couponCache.get(normalized);
  }

  let matchCount = 0;
  for (const fileName of COUPON_FILES) {
    const filePath = path.join(COUPON_DIR, fileName);
    const exists = await streamContainsCoupon(filePath, normalized);
    if (exists) {
      matchCount += 1;
      if (matchCount >= 2) {
        couponCache.set(normalized, true);
        return true;
      }
    }
  }

  couponCache.set(normalized, false);
  return false;
}

async function ensureCouponFilesAvailable() {
  for (const fileName of COUPON_FILES) {
    const filePath = path.join(COUPON_DIR, fileName);
    await fs.promises.access(filePath, fs.constants.R_OK);
  }
}

function roundTwo(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  validateCoupon,
  ensureCouponFilesAvailable,
  roundTwo
};
