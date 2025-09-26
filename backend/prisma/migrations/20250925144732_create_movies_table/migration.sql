-- CreateTable
CREATE TABLE "public"."movies" (
    "movie_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "genre" VARCHAR(100) NOT NULL,
    "movie_rating" VARCHAR(10) NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "trailer" VARCHAR(500),
    "movieImage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "public"."show_timings" (
    "show_id" SERIAL NOT NULL,
    "showDate" DATE NOT NULL,
    "room_id" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "show_timings_pkey" PRIMARY KEY ("show_id","showDate","room_id")
);

-- CreateTable
CREATE TABLE "public"."theater_rooms" (
    "room_id" SERIAL NOT NULL,
    "seatCapacity" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theater_rooms_pkey" PRIMARY KEY ("room_id")
);

-- AddForeignKey
ALTER TABLE "public"."show_timings" ADD CONSTRAINT "show_timings_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("movie_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."show_timings" ADD CONSTRAINT "show_timings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."theater_rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;
