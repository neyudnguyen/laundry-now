/*
  Warnings:

  - Added the required column `total_qrcode_delivery_fee` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."bills" ADD COLUMN     "total_qrcode_delivery_fee" INTEGER NOT NULL;
