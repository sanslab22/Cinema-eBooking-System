/*
  Warnings:

  - Added the required column `duration` to the `movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maskedCardNo` to the `payment_card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."address" DROP CONSTRAINT "address_userID_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_card" DROP CONSTRAINT "payment_card_userID_fkey";

-- AlterTable
ALTER TABLE "public"."address" ALTER COLUMN "userID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."movie" ADD COLUMN     "duration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."payment_card" ADD COLUMN     "maskedCardNo" VARCHAR(10) NOT NULL,
ALTER COLUMN "userID" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."booking" (
    "id" SERIAL NOT NULL,
    "noOfTickets" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "showTimeID" INTEGER NOT NULL,
    "cardID" INTEGER NOT NULL,
    "promoID" INTEGER NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket" (
    "id" SERIAL NOT NULL,
    "categoryID" INTEGER NOT NULL,
    "bookingID" INTEGER NOT NULL,
    "seatID" INTEGER NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "ticket_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."promotions" (
    "id" SERIAL NOT NULL,
    "promoCode" VARCHAR(20) NOT NULL,
    "promoValue" VARCHAR(20) NOT NULL,
    "startDate" DATE NOT NULL,
    "expirationDate" DATE NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_bookingID_seatID_key" ON "public"."ticket"("bookingID", "seatID");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_category_name_key" ON "public"."ticket_category"("name");

-- AddForeignKey
ALTER TABLE "public"."address" ADD CONSTRAINT "address_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_card" ADD CONSTRAINT "payment_card_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking" ADD CONSTRAINT "booking_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking" ADD CONSTRAINT "booking_showTimeID_fkey" FOREIGN KEY ("showTimeID") REFERENCES "public"."movie_show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking" ADD CONSTRAINT "booking_cardID_fkey" FOREIGN KEY ("cardID") REFERENCES "public"."payment_card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking" ADD CONSTRAINT "booking_promoID_fkey" FOREIGN KEY ("promoID") REFERENCES "public"."promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "public"."ticket_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_bookingID_fkey" FOREIGN KEY ("bookingID") REFERENCES "public"."booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket" ADD CONSTRAINT "ticket_seatID_fkey" FOREIGN KEY ("seatID") REFERENCES "public"."seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
