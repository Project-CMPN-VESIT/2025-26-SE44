-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'UNMARKED';

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "status" SET DEFAULT 'UNMARKED';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Community',
ADD COLUMN     "estimatedHours" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "slots" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "VolunteerProfile" ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'APPROVED';
