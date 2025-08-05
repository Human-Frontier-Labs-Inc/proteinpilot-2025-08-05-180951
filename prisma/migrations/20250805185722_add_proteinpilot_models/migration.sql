-- CreateTable
CREATE TABLE "UserApiLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "stripe_price_id" TEXT,
    "stripe_current_period_end" DATETIME
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "proteinGoalDaily" REAL DEFAULT 150,
    "calorieGoalDaily" REAL,
    "weight" REAL,
    "height" REAL,
    "activityLevel" TEXT DEFAULT 'moderate',
    "dietaryRestrictions" TEXT,
    "allergies" TEXT,
    "shareDataForResearch" BOOLEAN NOT NULL DEFAULT false,
    "allowNotifications" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "barcode" TEXT,
    "category" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbohydrates" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "fiber" REAL,
    "sugar" REAL,
    "sodium" REAL,
    "servingSize" REAL NOT NULL DEFAULT 100,
    "servingUnit" TEXT NOT NULL DEFAULT 'g',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT
);

-- CreateTable
CREATE TABLE "FoodLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "consumedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbohydrates" REAL NOT NULL,
    "fat" REAL NOT NULL,
    CONSTRAINT "FoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoodLog_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FavoriteFoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteFoodItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FavoriteFoodItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserApiLimit_userId_key" ON "UserApiLimit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_key" ON "UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_stripe_customer_id_key" ON "UserSubscription"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_stripe_subscription_id_key" ON "UserSubscription"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_barcode_key" ON "FoodItem"("barcode");

-- CreateIndex
CREATE INDEX "FoodItem_name_idx" ON "FoodItem"("name");

-- CreateIndex
CREATE INDEX "FoodItem_barcode_idx" ON "FoodItem"("barcode");

-- CreateIndex
CREATE INDEX "FoodItem_category_idx" ON "FoodItem"("category");

-- CreateIndex
CREATE INDEX "FoodLog_userId_consumedAt_idx" ON "FoodLog"("userId", "consumedAt");

-- CreateIndex
CREATE INDEX "FoodLog_userId_mealType_idx" ON "FoodLog"("userId", "mealType");

-- CreateIndex
CREATE INDEX "FavoriteFoodItem_userId_idx" ON "FavoriteFoodItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteFoodItem_userId_foodItemId_key" ON "FavoriteFoodItem"("userId", "foodItemId");
