-- AlterTable
ALTER TABLE "public"."movie" ADD COLUMN     "imagePoster" VARCHAR(500),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
