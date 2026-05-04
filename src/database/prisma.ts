// ─────────────────────────────────────────────────────────────────────────────
// database/prisma.ts
// Exports a single shared PrismaClient instance (singleton pattern).
// Creating multiple PrismaClient instances wastes connection-pool resources,
// so every file that needs DB access should import THIS module.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';

// Instantiate the Prisma client with environment-aware logging:
//  – development: log every SQL query + warnings so we can debug easily
//  – production:  log errors only to avoid noise in production logs
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Export the singleton so all service files share the same connection pool
export default prisma;
