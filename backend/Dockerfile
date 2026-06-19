FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm run swagger:build

# Final stage
FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
