# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Stage 2: Create the production image
FROM node:20-alpine

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Create output directory for podcasts
RUN mkdir -p /tmp/podcast-output && chmod 777 /tmp/podcast-output

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4200

# Expose the port the app runs on
EXPOSE 4200

# Start the application
CMD ["yarn", "start"]
