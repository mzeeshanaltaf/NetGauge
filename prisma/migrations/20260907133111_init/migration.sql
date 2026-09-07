-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadMbps" DECIMAL(65,30) NOT NULL,
    "uploadMbps" DECIMAL(65,30) NOT NULL,
    "idleMs" DECIMAL(65,30) NOT NULL,
    "jitterMs" DECIMAL(65,30) NOT NULL,
    "loadedDownMs" DECIMAL(65,30) NOT NULL,
    "loadedUpMs" DECIMAL(65,30) NOT NULL,
    "bufferbloat" TEXT NOT NULL,
    "isp" TEXT,
    "asn" INTEGER,
    "colo" TEXT,
    "city" TEXT,
    "country" TEXT,
    "ipHash" TEXT NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);
