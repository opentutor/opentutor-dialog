# syntax=docker/dockerfile:1.0.0-experimental
FROM node:18.13 as tsc-compile
WORKDIR /build
COPY . .
RUN npm ci
RUN npm run build
FROM node:18.13 as builder
WORKDIR /app
COPY . .
RUN npm ci --production
FROM node:18.13
COPY --from=tsc-compile /build/dist /app
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app
ENV NODE_PATH=/app
CMD ["src", "./server.js"]
EXPOSE 3000
