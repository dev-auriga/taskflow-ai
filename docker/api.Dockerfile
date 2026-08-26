# Multi-stage Dockerfile for NestJS API
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @taskflow/api --filter @taskflow/shared

# Stage 2: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
# Generate Prisma client
RUN cd apps/api && npx prisma generate
# Build shared package
RUN cd packages/shared && pnpm build
# Build API
RUN cd apps/api && npx nest build

# Stage 3: Production
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@taskflow/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@taskflow/shared/

EXPOSE 3001
CMD ["node", "dist/main.js"]
