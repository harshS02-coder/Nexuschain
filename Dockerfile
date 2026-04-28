# FROM node:20-alpine AS base
# WORKDIR /app

# FROM base AS deps
# COPY package.json package-lock.json ./
# RUN npm ci --prefer-offline --no-audit

# FROM deps AS build
# COPY . .
# RUN npm run build 

# FROM node:20-alpine AS production
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY --from=build /app/dist ./dist
# COPY package.json ./

# EXPOSE 3000
# CMD ["npm", "start"]


# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# ---------- Build ----------
FROM deps AS build
COPY . .
RUN npm run build

# ---------- Production ----------
FROM node:20-alpine AS production
WORKDIR /app

# Copy runtime dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built app
COPY --from=build /app/dist ./dist

# Copy package.json (needed for scripts)
COPY package.json ./

# 🔥 Copy Drizzle config + schema (REQUIRED for db:push)
COPY drizzle.config.js ./
COPY db ./db

# Expose port
EXPOSE 3000

# Start: push DB schema then run server
CMD ["sh", "-c", "npm run db:push && npm start"]