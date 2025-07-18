-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportType" TEXT NOT NULL DEFAULT 'positive-intervention',
    "status" TEXT NOT NULL DEFAULT 'closed',
    "ship" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "cause" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "procedure" TEXT NOT NULL DEFAULT 'not-observed',
    "actionsAndPositions" TEXT NOT NULL DEFAULT 'not-observed',
    "permits" TEXT NOT NULL DEFAULT 'not-observed',
    "isolationAndBarriers" TEXT NOT NULL DEFAULT 'not-observed',
    "personalProtectiveEquipment" TEXT NOT NULL DEFAULT 'not-observed',
    "toolsAndEquipment" TEXT NOT NULL DEFAULT 'not-observed',
    "housekeeping" TEXT NOT NULL DEFAULT 'not-observed',
    "others" TEXT NOT NULL DEFAULT 'not-observed',

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
