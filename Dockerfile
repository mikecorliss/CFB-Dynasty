# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy all files and build the application
COPY . .

# This runs 'vite build && esbuild ...' as defined in package.json
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Ensure production env
ENV NODE_ENV=production

# Expose port 3000
EXPOSE 3000

# Start Node
CMD ["npm", "run", "start"]
