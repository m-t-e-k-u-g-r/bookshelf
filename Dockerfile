ARG NODE_VERSION=24.13.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app


FROM base AS deps

COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json backend/package-lock.json ./frontend/

RUN npm ci


FROM deps AS build

COPY backend ./backend
COPY frontend ./frontend

# Run the build script.
RUN cd backend && npm run build
RUN cd frontend && npm run build


FROM base AS final

ENV NODE_ENV=production


COPY package.json ./

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist/backend ./dist/backend
COPY --from=build /usr/src/app/dist/frontend ./dist/frontend

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 5500

CMD ["npm", "start"]