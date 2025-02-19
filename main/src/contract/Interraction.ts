import { ethers } from 'ethers';
import type { TransactionReceipt } from 'ethers';

import { LibraryProtocolABI } from './arbitrum/libraryProtocolABI';
import { libraryBookABI } from './arbitrum/libraryBookABI';
import { libraryOwnerABI } from './arbitrum/libraryOwnerABI';


// Environment variables for contract addresses
// const LOA = process.env.LIBRARY_OWNER_ADDRESS; // Owner address (if needed)
// const LBA = process.env.LIBRARY_BOOK_ADDRESS; // LPBook address
// const LPA = process.env.LIBRARY_PROTOCOL_ADDRESS; // LibraryProtocol address

const LOA = '0xD0bb87ec3c5a531B364eDC413593d3c273896b75'; // Owner address (if needed)
const LBA = '0xCecD338bC4cBCae1f901F9E21b0Fc504fa36558c'; // LPBook address
const LPA = '0xC4C7F950eBC2e30e5c893A0fBEE7dd6Ac1F57B07'; // LibraryProtocol address

// Get ethers provider and signer
const getProviderAndSigner = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { provider, signer };
};

// Initialize contracts
const getContracts = async () => {
  const { signer } = await getProviderAndSigner();

  if (!LPA || !LBA || !LOA) {
    throw new Error('Contract addresses are not defined in environment variables');
  }

  const libraryProtocol = new ethers.Contract(LPA, LibraryProtocolABI, signer);
  const libraryBook = new ethers.Contract(LBA, libraryBookABI, signer);
  const libraryOwner = new ethers.Contract(LOA, libraryOwnerABI, signer);

  return { libraryProtocol, libraryBook, libraryOwner };
};

export type CuratorRegistrationData = {
  name: string;
};

export type BookData = {
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  pagination: number;
  additionalNotes: string;
  isbn: number;
  onChainUniqueId: string;
  copies: number;
};

export type BorrowBookData = {
  bookId: string;
  borrowDate: number;
  returnDate: number;
};


export type BorrowingStatus = 'Preparing' | 'Dispatched' | 'Delivered' | 'Returned' | 'Declined';

export type BorrowingLog = {
  borrowingId: string;
  wallet: string;
  status: BorrowingStatus;
  message?: string;
  createdAt: Date;
}
export type BorrowBookRequest = {
  borrowingId?: string; // Optional, can be string or undefined
  message: string;
  status: BorrowingStatus;
};

export type BookRequest = {
  title: string;
  author: string;
  additionalNotes: string;
  curatorId: string;
  status: string;
  isbn: string;
};

export type BookRequestLog = {
  requestId: string;
  status: string;
  message: string;
}

// Register a curator
export const registerCurator = async (
  data: CuratorRegistrationData
): Promise<{ success: boolean; uniqueId?: string; hash?: string; nftTokenId?: string}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.registerCurator(data.name, {
      gasLimit: 1000000,
    });

    const receipt = await tx.wait();

    console.log("Transaction Receipt:", receipt);

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    // ABI for LibraryOwnerRegistered event
    const abi = [
      "event LibraryOwnerRegistered(string uniqueId, address indexed wallet, string name, uint256 libraryTokenId)"
    ];

    const iface = new ethers.Interface(abi);
    let foundUniqueId: string | undefined;
    let nftTokenId: string

    // Loop through logs and decode them
    for (const log of receipt.logs) {
      console.log("\n--- Log Entry ---");
      console.log("Log Address:", log.address);
      console.log("Log Topics:", log.topics);
      console.log("Log Data:", log.data);

      try {
        // Parse the log using ethers v6.3 syntax
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {
          console.log("Decoded Log:", parsedLog);
          console.log("Event Name:", parsedLog.name);
          console.log("Unique ID:", parsedLog.args.uniqueId);
          console.log("Wallet Address:", parsedLog.args.wallet);
          console.log("Library Owner Name:", parsedLog.args.name);
          console.log("Library Token ID:", parsedLog.args.libraryTokenId.toString());
          console.log("Hash:", receipt.hash);

          foundUniqueId = parsedLog.args.uniqueId;
          nftTokenId = parsedLog.args.libraryTokenId.toString();

return {
            success: true,
            uniqueId: foundUniqueId,
            nftTokenId: nftTokenId,
            hash: receipt.hash,
          };
        }
      } catch (error) {
        console.error("Error decoding log:", error);
      }
    }

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to register curator');
  }
};

// Add a book
export const addBook = async (data: BookData): Promise<{ success: boolean; uniqueId?: string; hash?: string; nftTokenId?: string}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBook(
      data.title,
      data.author,
      data.publisher,
      data.publishDate,
      data.pagination,
      data.additionalNotes,
      data.onChainUniqueId,
      data.isbn,
      data.copies,
      {
        gasLimit: ethers.toBigInt(1000000), // Convert to BigInt in ethers v6
      }
    );

    console.log('Transaction Sent Payload', tx)

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt)

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    const abi = [
      "event BookAdded(string uniqueId, string title, string libraryOwnerId, uint256 isbn, uint256 bookTokenId, uint256 libraryTokenId, uint256 copies)"
    ];

    const iface = new ethers.Interface(abi);
    let foundUniqueId: string | undefined;
    let nftTokenId: string

    // Loop through logs and decode them
    for (const log of receipt.logs) {
      console.log("\n--- Log Entry ---");
      console.log("Log Address:", log.address);
      console.log("Log Topics:", log.topics);
      console.log("Log Data:", log.data);

      try {
        // Parse the log using ethers v6.3 syntax
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {
          console.log("Decoded Log:", parsedLog);
          console.log("Event Name:", parsedLog.name);
          console.log("Unique ID:", parsedLog.args.uniqueId);
          console.log("Title:", parsedLog.args.title);
          console.log("Library Owner Id:", parsedLog.args.libraryOwnerId);
          console.log("ISBN:", parsedLog.args.isbn);
          console.log("bookTokenId:", parsedLog.args.bookTokenId);
          console.log("libraryTokenId:", parsedLog.args.libraryTokenId);
          console.log("Copies:", parsedLog.args.copies);
          console.log("Hash:", receipt.hash);

          foundUniqueId = parsedLog.args.uniqueId;
          nftTokenId = parsedLog.args.bookTokenId.toString();

return {
            success: true,
            uniqueId: foundUniqueId,
            nftTokenId: nftTokenId,
            hash: receipt.hash,
          };
        }
      } catch (error) {
        console.error("Error decoding log:", error);
      }
    }

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const bookRequest = async (data: BookRequest): Promise<{ success: boolean; requestId?: string; uniqueId?: string; hash?: string;}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBookRequest(
      data.title,
      data.author,
      data.additionalNotes,
      data.curatorId,
      data.status,
      data.isbn,
      {
        gasLimit: ethers.toBigInt(1000000), // Convert to BigInt in ethers v6
      }
    );

    console.log('Transaction Sent Payload', tx)

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt)

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    const abi = [
      "event BookRequestAdded(string id, address wallet, uint256 isbn, string title, string author, string libraryOwnerId, string status)"
    ];

    const iface = new ethers.Interface(abi);
    let foundUniqueId: string | undefined;

    // Loop through logs and decode them
    for (const log of receipt.logs) {
      console.log("\n--- Log Entry ---");
      console.log("Log Address:", log.address);
      console.log("Log Topics:", log.topics);
      console.log("Log Data:", log.data);

      try {
        // Parse the log using ethers v6.3 syntax
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {
          console.log("Decoded Log:", parsedLog);
          console.log("Event Name:", parsedLog.name);
          console.log("Unique ID:", parsedLog.args.id);
          console.log("Title:", parsedLog.args.title);
          console.log("Title:", parsedLog.args.wallet);
          console.log("Library Owner Id:", parsedLog.args.libraryOwnerId);
          console.log("ISBN:", parsedLog.args.isbn);
          console.log("Status:", parsedLog.args.status);
          console.log("Hash:", receipt.hash);

          foundUniqueId = parsedLog.args.id;

          return {
            success: true,
            requestId: foundUniqueId,
            hash: receipt.hash,
          };
        }
      } catch (error) {
        console.error("Error decoding log:", error);
      }
    }

    return {
      success: true,
      hash: receipt.hash,
      uniqueId: foundUniqueId,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const bookRequestConfirmation = async (data: BookRequestLog): Promise<{ success: boolean; }> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBookRequestLog(
      data.requestId,
      data.status,
      data.message,
      {
        gasLimit: ethers.toBigInt(500000), // Convert to BigInt in ethers v6
      }
    );

    await getProviderAndSigner();
    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const borrowBookRequest = async (data: BorrowBookData): Promise<{ success: boolean;  borrowingId?: string; hash?: string;}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBorrowBook(
      data.bookId,
      data.borrowDate,
      data.returnDate,
      {
        gasLimit: ethers.toBigInt(1000000), // Convert to BigInt in ethers v6
      }
    );

    console.log('Transaction Sent Payload', tx)

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt)

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    const abi = [
      "event BookBorrowed(string borrowingId, string bookId, string bookTitle, string libraryOwnerId, address borrower, uint256 borrowDate, uint256 returnDate)"
    ];

    const iface = new ethers.Interface(abi);
    let foundUniqueId: string | undefined;

    // Loop through logs and decode them
    for (const log of receipt.logs) {
      console.log("\n--- Log Entry ---");
      console.log("Log Address:", log.address);
      console.log("Log Topics:", log.topics);
      console.log("Log Data:", log.data);

      try {
        // Parse the log using ethers v6.3 syntax
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {

          foundUniqueId = parsedLog.args.borrowingId;

          return {
            success: true,
            borrowingId: foundUniqueId,
            hash: receipt.hash,
          };
        }
      } catch (error) {
        console.error("Error decoding log:", error);
      }
    }

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const borrowBookRequestLogAndConfirmation = async (data: BorrowBookRequest): Promise<{ success: boolean;}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBorrowBookLog(
      data.borrowingId,
      data.status,
      data.message,
      {
        gasLimit: ethers.toBigInt(1000000), // Convert to BigInt in ethers v6
      }
    );

    console.log('Transaction Sent Payload', tx)

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt)

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};
