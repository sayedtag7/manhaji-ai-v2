FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Expose port
EXPOSE 5000

# Start command will be in docker-compose
CMD ["npm", "run", "dev"]
