-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegramid" TEXT NOT NULL,
    "username" TEXT,
    "avatarurl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "videourl" TEXT,
    "previewurl" TEXT,
    "sellerid" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unique_visitors" (
    "id" SERIAL NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "first_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "referral_code" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device_type" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "screen_resolution" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "is_mobile" BOOLEAN NOT NULL DEFAULT false,
    "is_tablet" BOOLEAN NOT NULL DEFAULT false,
    "is_desktop" BOOLEAN NOT NULL DEFAULT false,
    "total_visits" INTEGER NOT NULL DEFAULT 1,
    "total_page_views" INTEGER NOT NULL DEFAULT 1,
    "total_time_spent" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unique_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_statistics" (
    "id" SERIAL NOT NULL,
    "page_path" TEXT NOT NULL,
    "unique_visits" INTEGER NOT NULL DEFAULT 0,
    "total_visits" INTEGER NOT NULL DEFAULT 0,
    "last_visit" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_links" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_clicks" (
    "id" SERIAL NOT NULL,
    "referral_code" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramid_key" ON "users"("telegramid");

-- CreateIndex
CREATE UNIQUE INDEX "unique_visitors_visitor_id_key" ON "unique_visitors"("visitor_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_statistics_page_path_key" ON "page_statistics"("page_path");

-- CreateIndex
CREATE UNIQUE INDEX "referral_links_code_key" ON "referral_links"("code");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerid_fkey" FOREIGN KEY ("sellerid") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
