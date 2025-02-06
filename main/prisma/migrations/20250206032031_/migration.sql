-- CreateEnum
CREATE TYPE "BorrowingStatus" AS ENUM ('Preparing', 'Dispatched', 'Delivered', 'Returned');

-- CreateEnum
CREATE TYPE "BookRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curator" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "publicNotice" TEXT,
    "coverImage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Curator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookRequests" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "additionalNotes" TEXT,
    "curatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BookRequestStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "BookRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrowings" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "phone" TEXT,
    "borrowDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "curatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Borrowings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowingLogs" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "status" "BorrowingStatus" NOT NULL DEFAULT 'Preparing',
    "message" TEXT,
    "borrowingId" TEXT NOT NULL,
    "curatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BorrowingLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "Curator_wallet_key" ON "Curator"("wallet");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRequests" ADD CONSTRAINT "BookRequests_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrowings" ADD CONSTRAINT "Borrowings_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrowings" ADD CONSTRAINT "Borrowings_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowingLogs" ADD CONSTRAINT "BorrowingLogs_borrowingId_fkey" FOREIGN KEY ("borrowingId") REFERENCES "Borrowings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowingLogs" ADD CONSTRAINT "BorrowingLogs_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Curator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
