FROM node:20-alpine AS frontend-build
WORKDIR /usr/src/app
COPY kart-api/frontend/package.json ./frontend/package.json
COPY kart-api/frontend/vite.config.js ./frontend/vite.config.js
COPY kart-api/frontend/src ./frontend/src
RUN cd frontend && npm install && npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
COPY kart-api/package*.json ./
RUN npm ci --only=production
COPY kart-api ./
COPY --from=frontend-build /usr/src/app/frontend/dist ./frontend/dist
COPY backend-challenge ./backend-challenge

EXPOSE 5050
CMD ["node", "server.js"]
