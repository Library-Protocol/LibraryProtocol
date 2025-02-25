// engage.ts
"use server";
import jwt from "jsonwebtoken";

import { sendEngageSpotNotification } from "@/utils/engagespot";

export async function generateUserToken(walletAddress: string) {
  if (!walletAddress) throw new Error("Wallet address is required");

  const ENGAGESPOT_API_SECRET = process.env.ENGAGESPOT_API_SECRET;

  if (!ENGAGESPOT_API_SECRET) {
    throw new Error("Engagespot secret key is missing");
  }

  return jwt.sign({ walletAddress }, ENGAGESPOT_API_SECRET, {
    expiresIn: "1h",
  });
}

export async function sendLibraryCreatedNotificationToReader(libraryName: string, libraryId: string, userId: string) {

  console.log('Create library notification',libraryName, libraryId)

return sendEngageSpotNotification({
    workflowIdentifier: "library_creation",
    cancellationKey: `library_${libraryId}`,
    data: {
      "libraryName": libraryName,
      "libraryId": libraryId
    },
    recipients: [userId],
  });
}

export async function sendBookRequestNotificationToReader(bookTitle: string, bookAuthor: string, bookRequestId: string, libraryName: string, walletAddress: string) {

  console.log('Book Request library notification', bookTitle, libraryName)

return sendEngageSpotNotification({
    workflowIdentifier: "library_book_request",
    cancellationKey: `library_book_request_${bookRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "bookAuthor": bookAuthor,
      "libraryName": libraryName,
      "walletAddress": walletAddress
    },
    recipients: [walletAddress],
  });
}

export async function sendBookRequestConfirmationNotificationToReader(bookTitle: string, bookAuthor: string, bookISBN: string, bookRequestId: string, libraryName: string, status: string, walletAddress: string) {

  console.log('Book Request Confirmation reader notification', bookTitle, bookAuthor, bookISBN, bookRequestId, libraryName, status, walletAddress)

return sendEngageSpotNotification({
    workflowIdentifier: "library_book_request_confirmation_owner",
    cancellationKey: `library_book_request_confirmation_owner_${bookRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "bookAuthor": bookAuthor,
      "bookIsbn": bookISBN,
      "libraryName": libraryName,
      "status": status,
      "walletAddress": walletAddress
    },
    recipients: [walletAddress],
  });
}

export async function sendBookRequestRejectionNotificationToReader(bookTitle: string, bookAuthor: string, bookISBN: string, bookRequestId: string, libraryName: string, status: string, walletAddress: string) {

  console.log('Book Request Reject reader notification', bookTitle, bookAuthor, bookISBN, bookRequestId, libraryName, status, walletAddress)

return sendEngageSpotNotification({
    workflowIdentifier: "library_book_reject_confirmation_owner",
    cancellationKey: `library_book_reject_confirmation_owner_${bookRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "bookAuthor": bookAuthor,
      "bookIsbn": bookISBN,
      "libraryName": libraryName,
      "status": status,
      "walletAddress": walletAddress
    },
    recipients: [walletAddress],
  });
}

export async function sendBorrowRequestConfirmationNotificationToReader(bookTitle: string, bookAuthor: string, bookRequestId: string, libraryName: string, status: string, walletAddress: string) {

  console.log('Book Borrow Confirmation reader notification', bookTitle, bookAuthor, bookRequestId, libraryName, status, walletAddress)

return sendEngageSpotNotification({
    workflowIdentifier: "library_book_borrow_request_confirmation-_owner",
    cancellationKey: `library_book_borrow_request_confirmation-_owner_${bookRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "bookAuthor": bookAuthor,
      "libraryName": libraryName,
      "status": status,
      "walletAddress": walletAddress
    },
    recipients: [walletAddress],
  });
}

export async function sendBorrowDeclinedConfirmationNotificationToReader(bookTitle: string, bookAuthor: string, bookRequestId: string, libraryName: string, status: string, walletAddress: string) {

  console.log('Book Borrow Confirmation reader notification', bookTitle, bookAuthor, bookRequestId, libraryName, status, walletAddress)

return sendEngageSpotNotification({
    workflowIdentifier: "library_book_borrow_declined__confirmation_owner",
    cancellationKey: `library_book_borrow_declined__confirmation_owner_${bookRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "bookAuthor": bookAuthor,
      "libraryName": libraryName,
      "status": status,
      "walletAddress": walletAddress
    },
    recipients: [walletAddress],
  });
}

export async function sendBorrowUpdateNotificationToReader(bookTitle: string, newLogStatus: string, newLogMessage: string, borrowRequestId: string, libraryName: string, walletAddress: string) {

  console.log('Book Borrow Update reader notification', newLogStatus, newLogMessage, borrowRequestId, libraryName, walletAddress)

return sendEngageSpotNotification({
    workflowIdentifier: "library_book_borrow_update_owner",
    cancellationKey: `library_book_borrow_update_owner_${borrowRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "newLogStatus": newLogStatus,
      "newLogMessage": newLogMessage,
      "libraryName": libraryName,
      "walletAddress": walletAddress
    },
    recipients: [walletAddress],
  });
}

