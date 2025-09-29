/*
  Warnings:

  - You are about to drop the `payment_links` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."payment_links" DROP CONSTRAINT "payment_links_order_id_fkey";

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "order_code" INTEGER;

-- DropTable
DROP TABLE "public"."payment_links";

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "public"."orders"("order_code");
