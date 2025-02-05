// types.ts
export interface BorrowBookRequest {
  name: string;
  email: string;
  deliveryAddress: string;
  borrowDate: string;
  returnDate: string;
  bookId: string;
}
