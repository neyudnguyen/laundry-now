/*
  Warnings:

  - The values [delivered] on the enum `order_statuses` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."order_statuses_new" AS ENUM ('pending', 'accepted', 'in_progress', 'need_payment', 'completed', 'cancelled');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."orders" ALTER COLUMN "status" TYPE "public"."order_statuses_new" USING ("status"::text::"public"."order_statuses_new");
ALTER TYPE "public"."order_statuses" RENAME TO "order_statuses_old";
ALTER TYPE "public"."order_statuses_new" RENAME TO "order_statuses";
DROP TYPE "public"."order_statuses_old";
ALTER TABLE "public"."orders" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
