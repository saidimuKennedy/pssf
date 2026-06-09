/*
  Warnings:

  - You are about to drop the `otp_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "otp_requests" DROP CONSTRAINT "otp_requests_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "otp_verified_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "otp_requests";
