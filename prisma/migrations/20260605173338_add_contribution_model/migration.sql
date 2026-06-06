-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "employee_amount" DECIMAL(65,30) NOT NULL,
    "employer_amount" DECIMAL(65,30) NOT NULL,
    "date_received" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contributions_member_id_idx" ON "contributions"("member_id");

-- CreateIndex
CREATE INDEX "contributions_month_idx" ON "contributions"("month");

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
