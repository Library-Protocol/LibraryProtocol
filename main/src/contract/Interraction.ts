import { ethers } from 'ethers';
import type { TransactionReceipt } from 'ethers';

import { LibraryProtocolABI } from './arbitrum/libraryProtocolABI';
import { libraryBookABI } from './arbitrum/libraryBookABI';
import { libraryOwnerABI } from './arbitrum/libraryOwnerABI';

const LOA = '0x780f76717E71742D5d15194c7dbc7CCd98844248'; // Owner address (if needed)
const LBA = '0xB36d810D491Bf2d958D2a1547A7095D70ad19b13'; // LPBook address
const LPA = '0xD7333c322b8C457b55fC7B056A0c67e9515bA126'; // LibraryProtocol address

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

      console.log('Transaction Receipt:', receipt);

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
          console.log('\n--- Log Entry ---');
          console.log('Log Address:', log.address);
          console.log('Log Topics:', log.topics);
          console.log('Log Data:', log.data);

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

      // Fallback if event not found but transaction succeeded
      console.warn('LibraryOwnerRegistered event not found in logs');

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
        gasLimit: 1000000, // BigInt in ethers v6
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
      console.log('\n--- Log Entry ---');
      console.log('Log Address:', log.address);
      console.log('Log Topics:', log.topics);
      console.log('Log Data:', log.data);

      try {
        const parsedLog = iface.parseLog(log);

        if (parsedLog && parsedLog.name === 'BookAdded') {
          console.log('Decoded Log:', parsedLog);
          console.log('Event Name:', parsedLog.name);
          console.log('Unique ID:', parsedLog.args.uniqueId);
          console.log('Title:', parsedLog.args.title);
          console.log('Library Owner Id:', parsedLog.args.libraryOwnerId);
          console.log('ISBN:', parsedLog.args.isbn.toString());
          console.log('bookTokenId:', parsedLog.args.bookTokenId.toString());
          console.log('libraryTokenId:', parsedLog.args.libraryTokenId.toString());
          console.log('Copies:', parsedLog.args.copies.toString());
          console.log('Metadata CID:', parsedLog.args.metadataCID);
          console.log('Hash:', receipt.hash);

          // Return the required values
          return {
            success: true,
            uniqueId: parsedLog.args.uniqueId,
            hash: receipt.hash,
            nftTokenId: parsedLog.args.bookTokenId.toString(), // Convert BigInt to string
          };
        }
      } catch (error) {
        console.error('Error decoding log:', error);
        // Continue to next log if parsing fails (e.g., for TransferSingle event)
      }
    }

    // Fallback if BookAdded event is not found
    console.warn('BookAdded event not found in logs');
    
return {
      success: true,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
}

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
