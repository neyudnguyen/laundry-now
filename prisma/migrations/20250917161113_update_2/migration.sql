-- DropForeignKey
ALTER TABLE "public"."vendor_profiles" DROP CONSTRAINT "vendor_profiles_address_id_fkey";

-- AlterTable
ALTER TABLE "public"."vendor_profiles" ALTER COLUMN "address_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."vendor_profiles" ADD CONSTRAINT "vendor_profiles_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
