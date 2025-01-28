import { PrismaClient } from '@prisma/client';

// Extend the global object to include the prisma property
declare global {
  // Add the prisma property to the global object
  var prisma: PrismaClient | undefined;
}

// Ensure this file is treated as a global declaration file
export {};
