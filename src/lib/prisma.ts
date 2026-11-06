import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL;
  // If running locally (not in Vercel) and encountering Windows NAT64 IPv6 DNS timeout
  if (dbUrl && dbUrl.includes('aws-0-ap-south-1.pooler.supabase.com') && !process.env.VERCEL) {
    dbUrl = dbUrl.replace('aws-0-ap-south-1.pooler.supabase.com', '3.111.105.85');
    if (!dbUrl.includes('sslmode=')) {
      dbUrl += '&sslmode=require';
    }
  }

  return new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
