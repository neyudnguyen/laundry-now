-- CreateEnum
CREATE TYPE "public"."premium_package_types" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "public"."premium_statuses" AS ENUM ('active', 'expired', 'pending');

-- AlterTable
ALTER TABLE "public"."vendor_profiles" ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."premium_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."premium_package_types" NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_premium_packages" (
    "id" TEXT NOT NULL,
    "status" "public"."premium_statuses" NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "order_code" INTEGER,
    "vendor_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_premium_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_premium_packages_order_code_key" ON "public"."vendor_premium_packages"("order_code");

-- AddForeignKey
ALTER TABLE "public"."vendor_premium_packages" ADD CONSTRAINT "vendor_premium_packages_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_premium_packages" ADD CONSTRAINT "vendor_premium_packages_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."premium_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
