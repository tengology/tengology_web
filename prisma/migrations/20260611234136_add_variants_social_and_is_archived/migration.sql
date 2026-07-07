-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "stockCount" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" DATETIME,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SocialDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "platform" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "videoJobId" TEXT,
    "productId" TEXT,
    "theme" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialDraft_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "draftId" TEXT,
    "socialAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "platformPostId" TEXT,
    "platformPostUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "scheduledFor" DATETIME,
    "postedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "postTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "subcategory" TEXT,
    "materials" TEXT NOT NULL DEFAULT '',
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "stockCount" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
    "weight" REAL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "collection" TEXT,
    "intention" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "collection", "compareAtPrice", "createdAt", "fullDescription", "id", "isFeatured", "isPublished", "lowStockThreshold", "materials", "price", "shortDescription", "slug", "stockCount", "title", "updatedAt", "weight") SELECT "category", "collection", "compareAtPrice", "createdAt", "fullDescription", "id", "isFeatured", "isPublished", "lowStockThreshold", "materials", "price", "shortDescription", "slug", "stockCount", "title", "updatedAt", "weight" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SocialSchedule_platform_key" ON "SocialSchedule"("platform");
