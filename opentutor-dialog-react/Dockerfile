# syntax=docker/dockerfile:1.0.0-experimental
FROM node:14.16-alpine as tsc-compile
WORKDIR /build
COPY . .
RUN npm ci
RUN npm run build
FROM node:14.16-alpine as builder
WORKDIR /app
COPY . .
RUN npm ci --production
FROM node:14.16-alpine
COPY --from=tsc-compile /build/dist /app
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app
ENV NODE_PATH=/app
CMD ["src", "./server.js"]
EXPOSE 3000
