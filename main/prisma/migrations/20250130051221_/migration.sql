-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "publishDate" TEXT NOT NULL,
    "pagination" INTEGER NOT NULL,
    "additionalNotes" TEXT,
    "isbn" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "curatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Book_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Curator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wallet" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "coverImage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "BookRequests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "additionalNotes" TEXT,
    "curatorId" TEXT NOT NULL,
    CONSTRAINT "BookRequests_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Curator_wallet_key" ON "Curator"("wallet");
