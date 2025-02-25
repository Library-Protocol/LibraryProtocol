import { ethers } from 'ethers';
import type { TransactionReceipt } from 'ethers';

import { LibraryProtocolABI } from './arbitrum/libraryProtocolABI';
import { libraryBookABI } from './arbitrum/libraryBookABI';
import { libraryOwnerABI } from './arbitrum/libraryOwnerABI';

const LOA = '0x780f76717E71742D5d15194c7dbc7CCd98844248'; // Owner address (if needed)
const LBA = '0xB36d810D491Bf2d958D2a1547A7095D70ad19b13'; // LPBook address
const LPA = '0xD7333c322b8C457b55fC7B056A0c67e9515bA126'; // LibraryProtocol address

// Common wallet error messages for user-friendly display
const WALLET_ERROR_MESSAGES = {
  METAMASK_NOT_FOUND: 'MetaMask not installed. Please install MetaMask to continue.',
  WALLET_DISCONNECTED: 'Wallet not connected. Please connect your wallet.',
  USER_REJECTED: 'Transaction rejected. Please try again and approve the transaction to continue.',
  CHAIN_MISMATCH: 'You are connected to the wrong network. Please switch to Arbitrum.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction. Please check your balance.',
  GENERAL_ERROR: 'An error occurred with your wallet. Please try again.'
};

// Function to handle wallet errors and provide user-friendly messages
const handleWalletError = (error: any): string => {
  console.error('Wallet error:', error);

  // Extract error message
  const errorMessage = error?.message || '';

  // Check for specific error patterns
  if (!window.ethereum) {
    return WALLET_ERROR_MESSAGES.METAMASK_NOT_FOUND;
  } else if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
    return WALLET_ERROR_MESSAGES.USER_REJECTED;
  } else if (errorMessage.includes('network') || errorMessage.includes('chain')) {
    return WALLET_ERROR_MESSAGES.CHAIN_MISMATCH;
  } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('balance')) {
    return WALLET_ERROR_MESSAGES.INSUFFICIENT_FUNDS;
  } else if (errorMessage.includes('not connected') || errorMessage.includes('provider')) {
    return WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED;
  } else {
    // If unknown error, return general message and log the detailed error
    return `${WALLET_ERROR_MESSAGES.GENERAL_ERROR} (${errorMessage.slice(0, 100)}...)`;
  }
};

// Get ethers provider and signer with error handling
const getProviderAndSigner = async () => {
  try {
    if (!window.ethereum) {
      throw new Error(WALLET_ERROR_MESSAGES.METAMASK_NOT_FOUND);
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    // First check if accounts are available (user is connected)
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);
    }

    const signer = await provider.getSigner();


return { provider, signer };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Initialize contracts with error handling
const getContracts = async () => {
  try {
    const { signer } = await getProviderAndSigner();

    if (!LPA || !LBA || !LOA) {
      throw new Error('Contract addresses are not defined in environment variables');
    }

    const libraryProtocol = new ethers.Contract(LPA, LibraryProtocolABI, signer);
    const libraryBook = new ethers.Contract(LBA, libraryBookABI, signer);
    const libraryOwner = new ethers.Contract(LOA, libraryOwnerABI, signer);

    return { libraryProtocol, libraryBook, libraryOwner };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Rest of your type definitions remain the same...
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
  imageCID: string;
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
  borrowingId?: string;
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

// Updated function for registering curator with better error handling
export const registerCurator = async (
  data: CuratorRegistrationData,
  metadataCID: string,
  curatorPlatformFee: string
): Promise<{
  success: boolean;
  uniqueId?: string;
  hash?: string;
  nftTokenId?: string;
  name?: string;
  metadataCID?: string;
}> => {
  try {
    const { libraryProtocol } = await getContracts();
    const value = ethers.parseEther(curatorPlatformFee);

    console.log('libraryPayload', data.name, metadataCID, value);

    const tx = await libraryProtocol.registerCurator(data.name, metadataCID, {
      gasLimit: 1000000,
      value,
    });

    const receipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed: No logs found');
    }

    // ABI for LibraryOwnerRegistered event with all fields
    const abi = [
      'event LibraryOwnerRegistered(string uniqueId, address indexed wallet, string name, uint256 libraryTokenId, string metadataCID)',
    ];

    const iface = new ethers.Interface(abi);
    let foundUniqueId: string | undefined;
    let foundName: string | undefined;
    let nftTokenId: string | undefined;
    let foundMetadataCID: string | undefined;

    // Loop through logs and decode them
    for (const log of receipt.logs) {

      try {
        const parsedLog = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsedLog && parsedLog.name === 'LibraryOwnerRegistered') {
          foundUniqueId = parsedLog.args.uniqueId;
          foundName = parsedLog.args.name;
          nftTokenId = parsedLog.args.libraryTokenId.toString();
          foundMetadataCID = parsedLog.args.metadataCID;

          console.log('Decoded Event:', {
            uniqueId: foundUniqueId,
            wallet: parsedLog.args.wallet,
            name: foundName,
            libraryTokenId: nftTokenId,
            metadataCID: foundMetadataCID,
          });

          // Return all decoded fields
          return {
            success: true,
            uniqueId: foundUniqueId,
            hash: receipt.hash,
            nftTokenId: nftTokenId,
            name: foundName,
            metadataCID: foundMetadataCID,
          };
        }
      } catch (error) {
        console.error('Error decoding log:', error);
      }
    }

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Updated addBook function with better error handling
export const addBook = async (
  data: BookData
): Promise<{ success: boolean; uniqueId?: string; hash?: string; nftTokenId?: string }> => {
  try {
    const { libraryProtocol } = await getContracts();

    console.log(
      'libraryAddBookPayload',
      data.title,
      data.author,
      data.publisher,
      data.publishDate,
      data.pagination,
      data.additionalNotes,
      data.onChainUniqueId,
      data.isbn,
      data.copies,
      data.imageCID
    );


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
      data.imageCID,
      {
        gasLimit: 1000000,
      }
    );

    console.log('Transaction Sent Payload', tx);

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt);

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed: No logs found');
    }

    // ABI for the BookAdded event based on your Solidity function
    const abi = [
      'event BookAdded(string uniqueId, string title, string libraryOwnerId, uint256 isbn, uint256 bookTokenId, uint256 libraryTokenId, uint256 copies, string metadataCID)'
    ];

    const iface = new ethers.Interface(abi);

    // Find and decode the BookAdded event
    for (const log of receipt.logs) {

      try {
        const parsedLog = iface.parseLog(log);

        if (parsedLog && parsedLog.name === 'BookAdded') {

          // Return the required values
          return {
            success: true,
            uniqueId: parsedLog.args.uniqueId,
            hash: receipt.hash,
            nftTokenId: parsedLog.args.bookTokenId.toString(),
          };
        }
      } catch (error) {
        console.error('Error decoding log:', error);
      }
    }

    return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Updated bookRequest function with better error handling
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
        gasLimit: ethers.toBigInt(1000000),
      }
    );

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt);

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

      try {
        // Parse the log using ethers v6.3 syntax
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {

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
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// The remaining functions use the same pattern - add similar error handling for each
// Here's the bookRequestConfirmation with better error handling
export const bookRequestConfirmation = async (data: BookRequestLog): Promise<{ success: boolean; }> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBookRequestLog(
      data.requestId,
      data.status,
      data.message,
      {
        gasLimit: ethers.toBigInt(500000),
      }
    );

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// borrowBookRequest with error handling
export const borrowBookRequest = async (data: BorrowBookData): Promise<{ success: boolean; borrowingId?: string; hash?: string;}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBorrowBook(
      data.bookId,
      data.borrowDate,
      data.returnDate,
      {
        gasLimit: ethers.toBigInt(1000000),
      }
    );

    const receipt: TransactionReceipt = await tx.wait();

    console.log('Transaction Response Payload', receipt);

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
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Updating borrowing status with error handling
export const borrowBookRequestLogAndConfirmation = async (data: BorrowBookRequest): Promise<{ success: boolean;}> => {
  try {
    const { libraryProtocol } = await getContracts();

    const tx = await libraryProtocol.addBorrowBookLog(
      data.borrowingId,
      data.status,
      data.message,
      {
        gasLimit: ethers.toBigInt(1000000),
      }
    );

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};
