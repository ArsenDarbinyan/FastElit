-- CreateTable
CREATE TABLE "visitors" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "referer_url" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "custom_referral_code" TEXT,
    "visit_count" INTEGER NOT NULL DEFAULT 1,
    "first_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "city" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "current_url" TEXT,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);
