# Start from the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for dependency installation
COPY package*.json ./

# Install dependencies
#RUN npm install
RUN npm install bcryptjs && npm install

# Copy the entire application source (including src directory)
COPY . .

# Copy the .env.production file into .env
COPY .env.production .env

# Build the Next.js application for production
RUN npm run build

# Expose the application port (adjust if different)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
