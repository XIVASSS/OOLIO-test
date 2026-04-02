# Kart Challenge - Full Project Documentation

> This is a new, comprehensive README file created for the project. The existing `README.md` was left unchanged as requested.

---

## 1. Project Summary

This repository contains a full-stack demo project called **Kart Challenge**.
It is a dessert ordering experience built on:
- `Express` backend for API routes and request handling
- `React` frontend powered by `Vite` for fast local development
- `Express` static serving of the production React build
- A small coupon validation service and in-memory product dataset

This new README explains everything in minute detail, including the actual architecture, local setup, known limitations, and exactly why a simple Vercel deployment is broken for this repo.

---

## 2. Why this project exists

The app is designed as a modern food-ordering storefront with the following goals:
- clean UI for browsing dessert products
- responsive React experience for desktop and mobile
- cart management with quantity increment/decrement
- discount code support
- backend order submission and validation through Express
- remote image support for product thumbnails and cards

This is not just a static site. It is a full-stack solution with a Node server powering both the API and the frontend delivery.

---

## 3. Repository layout

The root repository contains:

- `README.md` - existing project README left untouched
- `README_FULL.md` - this newly created, detailed project documentation
- `kart-api/` - the full application subfolder

Inside `kart-api/`:

- `package.json` - backend dependencies and default start script
- `server.js` - app entry point
- `src/` - Express app source code
- `data/products.js` - product catalog with remote image URLs
- `public/` - legacy static fallback assets
- `frontend/` - React + Vite frontend application

Inside `kart-api/frontend/`:

- `package.json` - frontend dependencies
- `vite.config.js` - Vite build configuration
- `src/App.jsx` - main React application
- `src/styles.css` - UI styling and responsive layout
- `dist/` - compiled production frontend build output

---

## 4. What the app does

### Backend
The Express backend serves several key responsibilities:

- API endpoint `GET /product` returns the product catalog
- API endpoint `POST /order` accepts orders with items and optional coupon codes
- Coupon validation service loads compressed files and validates discount codes
- Static file serving for the frontend build from `frontend/dist`
- Fallback routing for SPA client-side navigation

### Frontend
The React frontend provides:

- a product grid with thumbnails and desktop images
- add-to-cart button and live cart count
- cart side panel with quantity controls
- discount code input for `HAPPYHOURS` and `BUYGETONE`
- order confirmation modal showing purchased items
- desktop/mobile responsive styling

---

## 5. Detailed architecture

### Backend architecture
The backend is intentionally simple and easy to understand.

- `server.js` starts the app and ensures coupon resources are available
- `src/app.js` sets up Express middleware, static hosting, and routes
- `src/routes/product-routes.js` returns the full product list
- `src/routes/order-routes.js` validates orders and returns the accepted request
- `src/services/coupon-service.js` loads coupon files from disk if available
- `src/middlewares/error-handler.js` captures and formats errors
- `src/utils/response.js` structures HTTP error responses
- `src/validators/order-validator.js` validates the request payload shape

### Frontend architecture
The frontend is a standard React app using Vite for bundling.

- `frontend/src/main.jsx` mounts the React tree
- `frontend/src/App.jsx` contains the entire UI, state, and order logic
- `frontend/src/styles.css` contains the theme, card layout, responsive grid, and modal style
- when built, the static assets are placed into `frontend/dist`

The backend will serve the built frontend automatically if `frontend/dist` exists.

---

## 6. Product dataset and remote images

The product catalog is located inside `kart-api/data/products.js`.
Each product includes:
- `id`
- `name`
- `price`
- `category`
- `image` object with `thumbnail`, `mobile`, `tablet`, and `desktop` remote URLs

These image URLs are fetched from an online source and are live remote assets.

---

## 7. Local running setup

### Required tools
- Node.js (preferred stable LTS version)
- npm

### Steps to run locally

1. Open a terminal
2. `cd kart-api`
3. `npm install`
4. `cd frontend && npm install`
5. `npm run build` from `kart-api/frontend`
6. `cd ..` to return to `kart-api`
7. `node server.js`
8. Open `http://localhost:5050` in the browser

The Express server will serve the built React app from `frontend/dist` and the API from `/product` and `/order`.

### Perfect local setup

My local environment is running perfectly with the following result:

- `node server.js` starts cleanly
- `Coupon files are available.` appears in the console
- `Server running on port 5050`
- `GET /product` returns a valid JSON product list
- `GET /` returns the React homepage
- the app works with cart additions, discount code input, and order submit flow

Screenshots have been shared with the team showing the exact local UI:

- product grid with dessert cards
- cart sidebar with item thumbnails and totals
- discount code panel and success state
- order confirmation modal

These screenshots represent the exact working local version.

---

## 8. Why the Vercel link is broken

This repo is not a pure static frontend app. It uses an **Express backend** to serve both:

- REST API endpoints (`/product`, `/order`)
- static production frontend build
- fallback routing for SPA requests

Because the app is Express-based, a plain Vercel static deployment will fail or break.

### Key reasons Vercel fails for this repo

- Vercel defaults to static deployment if there is no `vercel.json` or serverless configuration
- The project does not contain a dedicated Vercel serverless configuration
- The entrypoint is `kart-api/server.js`, which requires a Node runtime and cannot be deployed as a static site by default
- Vercel will not automatically know how to host the Express app unless you configure serverless functions or use a Node deployment target

### What should be done instead

To deploy this project successfully, use one of these approaches:

1. Deploy the backend as a Node server on a platform that supports Express (Heroku, Render, Railway, Fly, DigitalOcean App Platform)
2. Add a `vercel.json` and convert the Express routes into Vercel Serverless Functions
3. Split the app into a separate static frontend and a backend API, then deploy the frontend separately

At the moment, the Vercel link is broken because this is an Express-hosted full-stack app, not a static React-only site.

---

## 9. Important technical details

### Backend notes
- `server.js` is the application entrypoint
- the backend uses `express.json()` middleware
- static assets are served from `kart-api/frontend/dist` when available
- otherwise the fallback route serves `index.html`
- coupon file validation is done at server startup

### Frontend notes
- `App.jsx` contains all UI state and logic
- images are rendered using remote URLs
- the cart uses local React state only
- discount codes are handled client-side with validation for two codes
- order submission uses the `/order` endpoint with `api_key` header

### Data notes
- product images use remote CDN URLs
- backend data is currently in-memory and not persistent
- order POSTs are accepted and returned without real payment processing

---

## 10. What was added

This README is intentionally new and does not replace or modify the original `README.md`.

The project includes:

- complete Express backend in `kart-api/`
- React frontend in `kart-api/frontend/`
- product dataset with remote images
- discount and order support
- new documentation in `README_FULL.md`

---

## 11. How to validate this repo

Run locally and verify:

- `cd kart-api`
- `node server.js`
- open `http://localhost:5050`
- inspect `/product` JSON

If you want to see the app in the browser, use that local URL. The Vercel deployment is not valid for this app without additional server configuration.

---

## 12. Recommended next steps

If you want this hosted on Vercel, follow one of these options:

- Create a `vercel.json` and convert Express routes into Vercel function endpoints
- OR deploy `kart-api/server.js` on a Node-capable hosting provider
- OR separate the React app into a standalone frontend repo, then keep the Express backend on a server host

For now, the fastest and most stable installation is local:

```bash
cd kart-api
npm install
cd frontend
npm install
npm run build
cd ..
node server.js
```

Then open:

```text
http://localhost:5050
```

---

## 13. Contact and notes

If the team wants a production deployment, the best path is to treat this as a Node backend + static frontend system, not a pure Vercel static site.

The UI screenshots already shared to the team show the working local version, and this README explains exactly why the Vercel link is broken and how to make the app run properly.

---

## 14. File location

This README is located at `README_FULL.md` in the repository root. It is intentionally separate from the existing `README.md`.
