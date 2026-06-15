# ---- Dependencies stage ----
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
# Reproducible, audited install (no dev scripts run)
RUN npm ci --omit=dev

# ---- Build / generate stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.js ./prisma.config.js

# Generate Prisma client (no DB connection needed)
RUN npx prisma generate

COPY . .

# ---- Production stage ----
FROM node:22-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what's needed at runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.js ./prisma.config.js
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/config ./config
COPY --from=build /app/controllers ./controllers
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/routes ./routes
COPY --from=build /app/services ./services
COPY --from=build /app/scripts ./scripts

# Create uploads directory (mounted as volume in production)
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Prisma generate + migrate deploy happen at container start via docker-compose command
CMD ["node", "server.js"]
