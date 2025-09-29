-- CreateTable
CREATE TABLE "public"."payment_links" (
    "id" TEXT NOT NULL,
    "payment_link_id" TEXT NOT NULL,
    "order_code" INTEGER NOT NULL,
    "checkout_url" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_payment_link_id_key" ON "public"."payment_links"("payment_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_order_code_key" ON "public"."payment_links"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_order_id_key" ON "public"."payment_links"("order_id");

-- AddForeignKey
ALTER TABLE "public"."payment_links" ADD CONSTRAINT "payment_links_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
