# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY public/ ./public/
COPY src/ ./src/
COPY index.html vite.config.js eslint.config.js ./
RUN npm run build

# Stage 2: Backend + serve built frontend
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY db/ ../db/

# Vite copies public/ into dist/ at build time
COPY --from=frontend-build /app/dist ../dist/

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
