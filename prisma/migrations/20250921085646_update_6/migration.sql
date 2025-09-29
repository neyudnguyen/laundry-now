/*
  Warnings:

  - You are about to alter the column `fee` on the `vendor_service_fees` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "public"."payment_methods" AS ENUM ('cod', 'qrcode');

-- CreateEnum
CREATE TYPE "public"."payment_statuses" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "public"."order_statuses" AS ENUM ('pending', 'accepted', 'in_progress', 'delivered', 'need_payment', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."pickup_types" AS ENUM ('home', 'store');

-- AlterTable
ALTER TABLE "public"."vendor_service_fees" ALTER COLUMN "fee" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "status" "public"."order_statuses" NOT NULL DEFAULT 'pending',
    "payment_status" "public"."payment_statuses" NOT NULL DEFAULT 'pending',
    "payment_method" "public"."payment_methods" NOT NULL DEFAULT 'cod',
    "pickup_type" "public"."pickup_types" NOT NULL DEFAULT 'store',
    "service_price" INTEGER NOT NULL DEFAULT 0,
    "delivery_fee" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "customer_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
