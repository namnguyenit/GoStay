-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- AlterTable
ALTER TABLE "cars" ADD COLUMN     "status" "CarStatus" NOT NULL DEFAULT 'ACTIVE';
