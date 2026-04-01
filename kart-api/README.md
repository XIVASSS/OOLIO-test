# Kart API

Node.js implementation of the Order Food Online API based on the OpenAPI 3.1 specification.

## Features

- `GET /product` - list available products
- `GET /product/:productId` - get a single product by ID
- `POST /order` - place an order with optional promo code
- `couponCode` validation based on three large gzip files
- API key protection for order creation
- Robust request validation and JSON error handling

## Promo validation rules

A promo code is valid when:

1. it is a string of length between 8 and 10 characters
2. it exists in at least two of the provided coupon files:
   - `backend-challenge/couponbase1.gz`
   - `backend-challenge/couponbase2.gz`
   - `backend-challenge/couponbase3.gz`

## Run locally

```bash
cd kart-api
npm install
cd frontend
npm install
npm run build
cd ..
node server.js
```

The server listens on port `5050` by default.

Open `http://localhost:5050` in your browser to use the React food ordering web app.

## Frontend development

```bash
cd kart-api/frontend
npm install
npm run dev
```

Frontend dev server runs on port `5173` and proxies API requests to `http://localhost:5050`.

## API key

Use header `api_key: apitest` for the `/order` endpoint.

## Docker

Build the image from the repository root:

```bash
docker build -f kart-api/Dockerfile -t kart-api .
```

Run the container:

```bash
docker run -p 5050:5050 kart-api
```
