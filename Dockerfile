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

# Build frontend + backend (your custom script)
RUN npm run build

# ---------- Production ----------
FROM node:20-alpine AS production
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built output
COPY --from=build /app/dist ./dist

# Copy required runtime files
COPY package.json ./
COPY drizzle.config.ts ./
COPY db ./db

# Expose port
EXPOSE 3000

# 🔥 Run DB sync then start server
CMD ["sh", "-c", "npm run db:push && npm start"]