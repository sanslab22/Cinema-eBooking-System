/*
  Warnings:

  - You are about to drop the `movies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `show_timings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `theater_rooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."show_timings" DROP CONSTRAINT "show_timings_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."show_timings" DROP CONSTRAINT "show_timings_room_id_fkey";

-- DropTable
DROP TABLE "public"."movies";

-- DropTable
DROP TABLE "public"."show_timings";

-- DropTable
DROP TABLE "public"."theater_rooms";

-- CreateTable
CREATE TABLE "public"."movie" (
    "id" SERIAL NOT NULL,
    "movieTitle" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "cast" TEXT NOT NULL,
    "director" VARCHAR(255) NOT NULL,
    "producer" VARCHAR(255) NOT NULL,
    "synopsis" TEXT,
    "trailerURL" VARCHAR(500),
    "filmRating" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review" (
    "id" SERIAL NOT NULL,
    "reviewText" TEXT NOT NULL,
    "movieTitle" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."theater" (
    "id" SERIAL NOT NULL,
    "theaterName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auditorium" (
    "id" SERIAL NOT NULL,
    "AuditoriumName" VARCHAR(255) NOT NULL,
    "noOfSeats" INTEGER NOT NULL,
    "theaterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditorium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seat" (
    "id" SERIAL NOT NULL,
    "auditoriumID" INTEGER NOT NULL,
    "rowNum" VARCHAR(10) NOT NULL,
    "colNum" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movie_show" (
    "id" SERIAL NOT NULL,
    "showID" INTEGER NOT NULL,
    "movieID" INTEGER NOT NULL,
    "auditoriumID" INTEGER NOT NULL,
    "showStartTime" TIMESTAMP(3) NOT NULL,
    "noAvailabileSeats" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."show_seats" (
    "seatID" INTEGER NOT NULL,
    "showID" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "show_seats_pkey" PRIMARY KEY ("seatID","showID")
);

-- CreateTable
CREATE TABLE "public"."user_type" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "user_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_status" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "user_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "refreshTokenId" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "EnrollforPromotions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userTypeId" INTEGER NOT NULL,
    "userStatusId" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address_type" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "address_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address" (
    "id" SERIAL NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "zipCode" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressTypeId" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_card" (
    "id" SERIAL NOT NULL,
    "cardNo" VARCHAR(255) NOT NULL,
    "expirationDate" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userID" INTEGER NOT NULL,
    "billingAddressId" INTEGER NOT NULL,

    CONSTRAINT "payment_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movie_movieTitle_key" ON "public"."movie"("movieTitle");

-- CreateIndex
CREATE UNIQUE INDEX "theater_theaterName_key" ON "public"."theater"("theaterName");

-- CreateIndex
CREATE UNIQUE INDEX "auditorium_theaterId_AuditoriumName_key" ON "public"."auditorium"("theaterId", "AuditoriumName");

-- CreateIndex
CREATE UNIQUE INDEX "seat_auditoriumID_rowNum_colNum_key" ON "public"."seat"("auditoriumID", "rowNum", "colNum");

-- CreateIndex
CREATE UNIQUE INDEX "movie_show_showID_movieID_auditoriumID_showStartTime_key" ON "public"."movie_show"("showID", "movieID", "auditoriumID", "showStartTime");

-- CreateIndex
CREATE UNIQUE INDEX "user_type_name_key" ON "public"."user_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_status_name_key" ON "public"."user_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_refreshTokenId_key" ON "public"."user"("refreshTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "address_type_name_key" ON "public"."address_type"("name");

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_movieTitle_fkey" FOREIGN KEY ("movieTitle") REFERENCES "public"."movie"("movieTitle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auditorium" ADD CONSTRAINT "auditorium_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "public"."theater"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seat" ADD CONSTRAINT "seat_auditoriumID_fkey" FOREIGN KEY ("auditoriumID") REFERENCES "public"."auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movie_show" ADD CONSTRAINT "movie_show_movieID_fkey" FOREIGN KEY ("movieID") REFERENCES "public"."movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movie_show" ADD CONSTRAINT "movie_show_auditoriumID_fkey" FOREIGN KEY ("auditoriumID") REFERENCES "public"."auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."show_seats" ADD CONSTRAINT "show_seats_seatID_fkey" FOREIGN KEY ("seatID") REFERENCES "public"."seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."show_seats" ADD CONSTRAINT "show_seats_showID_fkey" FOREIGN KEY ("showID") REFERENCES "public"."movie_show"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "public"."user_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_userStatusId_fkey" FOREIGN KEY ("userStatusId") REFERENCES "public"."user_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."address" ADD CONSTRAINT "address_addressTypeId_fkey" FOREIGN KEY ("addressTypeId") REFERENCES "public"."address_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."address" ADD CONSTRAINT "address_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_card" ADD CONSTRAINT "payment_card_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_card" ADD CONSTRAINT "payment_card_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "public"."address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
