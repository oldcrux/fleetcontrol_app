# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies (only for building)
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Set production environment and build
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy necessary files from the build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --only=production

# Copy environment file
COPY .env.production .env

# Expose application port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
