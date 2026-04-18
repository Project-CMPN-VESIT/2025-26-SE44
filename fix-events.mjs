import { PrismaClient } from './app/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await prisma.event.deleteMany({});

await prisma.event.create({
  data: {
    title: "Vanmahotsav Tree Plantation",
    description: "Tree plantation drive for environment awareness",
    location: "Mumbai, Maharashtra",
    date: new Date("2026-04-23T10:00:00.000Z"),
    status: "UPCOMING"
  }
});

console.log("Done! Event created.");
await prisma.$disconnect();
