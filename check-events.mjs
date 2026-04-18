import { PrismaClient } from './app/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const events = await prisma.event.findMany();
console.log(JSON.stringify(events, null, 2));
await prisma.$disconnect();
