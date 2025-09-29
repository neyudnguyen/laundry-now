-- CreateEnum
CREATE TYPE "public"."bill_statuses" AS ENUM ('pending', 'paid');

-- AlterTable
ALTER TABLE "public"."bills" ADD COLUMN     "status" "public"."bill_statuses" NOT NULL DEFAULT 'pending';
