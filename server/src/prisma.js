const { PrismaClient } = require('@prisma/client');

// Singleton Prisma client with connection pool tuning for Neon's PgBouncer pooler.
// connection_limit: cap Prisma's internal pool so it plays well with the pooler's max connections.
// pool_timeout:     fail fast if no connection is available within 10 s rather than hanging forever.
// connect_timeout:  TCP connection to Neon must succeed within 10 s.
let databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl && !databaseUrl.includes('connection_limit=')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl += `${separator}connection_limit=5&pool_timeout=10&connect_timeout=10`;
}

const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
