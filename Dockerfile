FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci --workspace server --include-workspace-root=false
COPY server/tsconfig.json server/tsconfig.json
COPY server/src server/src
RUN npm run build --workspace server
RUN npm prune --omit=dev --workspace server --include-workspace-root=false

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/server/package.json ./server/package.json
COPY --from=build --chown=node:node /app/server/dist ./server/dist
USER node
WORKDIR /app/server
EXPOSE 5000
CMD ["node", "dist/server.js"]
