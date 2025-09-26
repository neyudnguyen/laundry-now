-- CreateEnum
CREATE TYPE "public"."complaint_statuses" AS ENUM ('pending', 'in_review', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "public"."complaints" (
    "id" TEXT NOT NULL,
    "status" "public"."complaint_statuses" NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "complaints_order_id_key" ON "public"."complaints"("order_id");

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
