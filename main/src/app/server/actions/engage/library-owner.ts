// engage.ts
"use server";
import { sendEngageSpotNotification } from "@/utils/engagespot";

export async function sendBookRequestNotificationToLibrary(bookTitle: string, bookRequestId: string, bookAuthor: string, libraryId: string, walletAddress: string) {

  console.log('Send book request notification to library', bookTitle, bookRequestId, bookAuthor)
  
return sendEngageSpotNotification({
    workflowIdentifier: "library_book_request_library",
    cancellationKey: `library_owner_book_request_${bookRequestId}`,
    data: {
      "bookTitle": bookTitle,
      "bookAuthor": bookAuthor,
      "libraryId": libraryId
    },
    recipients: [walletAddress],
  });
}


export async function sendBookBorrowRequestNotificationToLibrary(borrowerName: string, bookTitle: string, bookId: string, walletAddress: string) {

  console.log('Send book request notification to library', borrowerName, bookTitle, bookId, walletAddress)
  
return sendEngageSpotNotification({
    workflowIdentifier: "library_book_borrow_request_library",
    cancellationKey: `library_book_borrow_request_library_${bookId}`,
    data: {
      "bookTitle": bookTitle,
      "borrowerName": borrowerName,
    },
    recipients: [walletAddress],
  });
}
