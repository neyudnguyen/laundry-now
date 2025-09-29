-- CreateTable
CREATE TABLE "public"."bills" (
    "id" TEXT NOT NULL,
    "total_cod" INTEGER NOT NULL,
    "total_qrcode" INTEGER NOT NULL,
    "total_cod_completed" INTEGER NOT NULL,
    "total_qrcode_completed" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "vendor_id" TEXT NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bills_vendor_id_key" ON "public"."bills"("vendor_id");

-- AddForeignKey
ALTER TABLE "public"."bills" ADD CONSTRAINT "bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
