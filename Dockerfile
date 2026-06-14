# ============================================================
# Kiviuly — single image: Bun server that serves the built
# client AND the API + SQLite, all on one port (5678).
# ============================================================

# ---- Stage 1: build the client (Vite) ----
FROM oven/bun:1.3 AS client-build
WORKDIR /app
# deps first for better layer caching
COPY client/package.json client/bun.lock ./client/
COPY shared ./shared
RUN cd client && bun install --frozen-lockfile
COPY client ./client
RUN cd client && bun run build

# ---- Stage 2: install server deps ----
FROM oven/bun:1.3 AS server-deps
WORKDIR /app
COPY server/package.json server/bun.lock ./server/
RUN cd server && bun install --frozen-lockfile --production

# ---- Stage 3: runtime ----
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5678 \
    HOST=0.0.0.0 \
    DB_PATH=/data/kiviuly.db \
    STATIC_DIR=/app/client/dist

# server source + its deps
COPY server ./server
COPY --from=server-deps /app/server/node_modules ./server/node_modules
# shared contract (imported by the server at runtime)
COPY shared ./shared
# built static client
COPY --from=client-build /app/client/dist ./client/dist

# persistent data dir for the SQLite database
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 5678
WORKDIR /app/server
CMD ["bun", "src/index.ts"]
