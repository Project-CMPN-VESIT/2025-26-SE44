import bcrypt from 'bcryptjs';
import { PrismaClient } from './app/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const hash = await bcrypt.hash('admin123', 10);
await prisma.user.upsert({
  where: { email: 'admin@sevaconnect.com' },
  update: {},
  create: { email: 'admin@sevaconnect.com', passwordHash: hash, role: 'ADMIN' }
});
console.log('Done! Admin: admin@sevaconnect.com / admin123');
await prisma.$disconnect();
