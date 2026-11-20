FROM node:26-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:26-alpine AS runtime

ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist/Yui ./dist/Yui

EXPOSE 4000

USER node

CMD ["node", "dist/Yui/server/server.mjs"]
