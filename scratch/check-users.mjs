import { PrismaClient } from './app/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
