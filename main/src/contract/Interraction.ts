import { ethers } from 'ethers';
import type { Log, TransactionReceipt } from 'ethers';

import { arbitrumABI } from './arbitrum/contractConfig';

// Contract address should be replaced with your actual deployed contract address
const CONTRACT_ADDRESS = '0x053cea4934F722B63c4ac484484bB157d278a614';

// Get ethers provider and signer
const getProviderAndSigner = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { provider, signer };

};

// Initialize contract
const getContract = async () => {
  const { signer } = await getProviderAndSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, arbitrumABI, signer);

};

export type CuratorRegistrationData = {
  name: string;
  registerFee: string;
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
};

export type BorrowBookData = {
  bookId: string;
  borrowDate: number;
  returnDate: number;
};


export type BorrowingStatus = 'Preparing' | 'Dispatched' | 'Delivered' | 'Returned';

export type BorrowingLog = {
  id: string;
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
  data: CuratorRegistrationData
): Promise<{ success: boolean; uniqueId?: string; hash: string }> => {
  try {
    const contract = await getContract();

    const tx = await contract.registerAsCurator(data.name, {
      value: ethers.parseUnits(data.registerFee)
    });

    await getProviderAndSigner();
    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    // Extract event log for `CuratorRegistered`
    const eventLog = receipt.logs.find((log: Log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);

        return parsedLog?.name === "CuratorRegistered";

      } catch {
        return false;
      }
    });

    if (!eventLog) {
      throw new Error("CuratorRegistered event not found in transaction logs");
    }

    const parsedLog = contract.interface.parseLog(eventLog);

    if (!parsedLog) {
      throw new Error("Failed to parse event log");
    }

    const uniqueId = parsedLog.args[0]; // First indexed param is uniqueId

    return {
      success: true,
      uniqueId,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error("Contract interaction failed:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to register curator");
  }
};

export const addBook = async (data: BookData): Promise<{ success: boolean; hash: string; uniqueId: string }> => {
  try {
    const contract = await getContract();

    const tx = await contract.addBook(
      data.title,
      data.author,
      data.publisher,
      data.publishDate,
      data.pagination,
      data.additionalNotes,
      data.onChainUniqueId,
      data.isbn,
    );

    await getProviderAndSigner();
    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    // Extract event log for `CuratorRegistered`
    const eventLog = receipt.logs.find((log: Log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);

        return parsedLog?.name === "BookAdded";

      } catch {
        return false;
      }
    });

    if (!eventLog) {
      throw new Error("CuratorRegistered event not found in transaction logs");
    }

    const parsedLog = contract.interface.parseLog(eventLog);

    if (!parsedLog) {
      throw new Error("Failed to parse event log");
    }

    const uniqueId = parsedLog.args[0];

    return {
      success: true,
      uniqueId,
      hash: receipt.hash,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const borrowThisBook = async (data: BorrowBookData): Promise<{ success: boolean; borrowingId: string }> => {
  try {
    const contract = await getContract();

    const tx = await contract.borrowBook(
      data.bookId,
      data.borrowDate,
      data.returnDate,
    );

    const receipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    // Extract the event log
    const eventLog = receipt.logs.find((log: Log) => {
      try {
          const parsedLog = contract.interface.parseLog(log);

          return parsedLog?.name === "BookBorrowed"; // Event name from the smart contract

      } catch (error) {
          return false;
      }
    });

    if (!eventLog) {
      console.error("BookBorrowed event not found!");

      return { success: false, borrowingId: '' };
    }

    const parsedLog = contract.interface.parseLog(eventLog);

    if (!parsedLog) {
      throw new Error("Failed to parse event log");
    }

    const borrowingId = parsedLog.args.borrowingId; // Extract the borrowingId

    return {
      success: true,
      borrowingId: borrowingId
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const borrowBookConfirmationAndStatusUpdate = async (data: BorrowBookRequest): Promise<{ success: boolean; }> => {
  try {
    const contract = await getContract();

    const tx = await contract.addBorrowingLog(
      data.borrowingId,
      data.status,
      data.message
    );

    const receipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error('Transaction failed');
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const bookRequest = async (data: BookRequest): Promise<{ success: boolean; requestId: string, hash: string}> => {
  try {
    const contract = await getContract();

    const tx = await contract.addBookRequest(
      data.title,
      data.author,
      data.additionalNotes,
      data.curatorId,
      data.status,
      data.isbn,
    );

    await getProviderAndSigner();
    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    const eventLog = receipt.logs.find((log: Log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);

        return parsedLog?.name === "BookRequestAdded";

      } catch {
        return false;
      }
    });

    if (!eventLog) {
      throw new Error("BookRequestAdded event not found in transaction logs");
    }

    const parsedLog = contract.interface.parseLog(eventLog);

    if (!parsedLog) {
      throw new Error("Failed to parse event log");
    }

    const uniqueId = parsedLog.args[0];

    return {
      success: true,
      requestId: uniqueId,
      hash: receipt.hash,
    };

  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};

export const bookRequestConfirmation = async (data: BookRequestLog): Promise<{ success: boolean; }> => {
  try {
    const contract = await getContract();

    const tx = await contract.addBookRequestLog(
      data.requestId,
      data.status,
      data.message,
    );

    await getProviderAndSigner();
    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) {
      throw new Error("Transaction failed");
    }

    // Extract event log for `CuratorRegistered`
    const eventLog = receipt.logs.find((log: Log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);

        return parsedLog?.name === "BookRequestLogAdded";

      } catch {
        return false;
      }
    });

    if (!eventLog) {
      throw new Error("addBookRequestLog event not found in transaction logs");
    }

    const parsedLog = contract.interface.parseLog(eventLog);

    if (!parsedLog) {
      throw new Error("Failed to parse event log");
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add book');
  }
};
