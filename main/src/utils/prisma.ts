import { PrismaClient } from '@prisma/client';

// Create a single instance of PrismaClient
const prisma = new PrismaClient();

// Handle potential issues in production environments
if (process.env.NODE_ENV === 'development') {
  // This will prevent new instances of PrismaClient from being created on every reload.
  // Useful for development mode.
  global.prisma = prisma;
}

export default prisma;
