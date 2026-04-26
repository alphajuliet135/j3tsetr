-- CreateTable
CREATE TABLE "StayBreak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "notes" TEXT,
    "journeyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StayBreak_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Journey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shareToken" TEXT NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "autoDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Journey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Journey" ("createdAt", "description", "id", "isShared", "name", "shareToken", "updatedAt", "userId") SELECT "createdAt", "description", "id", "isShared", "name", "shareToken", "updatedAt", "userId" FROM "Journey";
DROP TABLE "Journey";
ALTER TABLE "new_Journey" RENAME TO "Journey";
CREATE UNIQUE INDEX "Journey_shareToken_key" ON "Journey"("shareToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
