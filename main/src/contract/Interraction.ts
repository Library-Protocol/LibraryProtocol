import { ethers } from 'ethers';
import type { TransactionReceipt } from 'ethers';

import { LibraryProtocolABI } from './arbitrum/libraryProtocolABI';
import { libraryBookABI } from './arbitrum/libraryBookABI';
import { libraryOwnerABI } from './arbitrum/libraryOwnerABI';

const LOA = '0x780f76717E71742D5d15194c7dbc7Cd98844248'; // Owner address
const LBA = '0xB36d810D491Bf2d958D2a1547A7095D70ad19b13'; // LPBook address
const LPA = '0xD7333c322b8C457b55fC7B056A0c67e9515bA126'; // LibraryProtocol address
const ARBITRUM_CHAIN_ID = 42161; // Arbitrum Mainnet Chain ID

// Common wallet error messages
const WALLET_ERROR_MESSAGES = {
  METAMASK_NOT_FOUND: 'MetaMask not installed. Please install MetaMask to continue.',
  WALLET_DISCONNECTED: 'Wallet not connected. Please connect your wallet.',
  USER_REJECTED: 'Transaction rejected. Please try again and approve the transaction.',
  CHAIN_MISMATCH: 'You are connected to the wrong network. Please switch to Arbitrum.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction. Please check your balance.',
  NONCE_MISMATCH: 'Transaction failed due to nonce mismatch. Please reset your wallet nonce or try again.',
  GAS_UNDERPRICED: 'Transaction failed: Gas price too low. Please increase gas price and try again.',
  GENERAL_ERROR: 'An error occurred with your wallet. Please try again.',
};

// Enhanced error handling
const handleWalletError = (error: any): string => {
  console.error('Wallet error:', error);
  const errorMessage = error?.message || '';

  if (!window.ethereum) {
    return WALLET_ERROR_MESSAGES.METAMASK_NOT_FOUND;
  } else if (error.code === 4001 || errorMessage.includes('user rejected')) {
    return WALLET_ERROR_MESSAGES.USER_REJECTED;
  } else if (errorMessage.includes('network') || errorMessage.includes('chain')) {
    return WALLET_ERROR_MESSAGES.CHAIN_MISMATCH;
  } else if (errorMessage.includes('insufficient funds')) {
    return WALLET_ERROR_MESSAGES.INSUFFICIENT_FUNDS;
  } else if (errorMessage.includes('not connected') || errorMessage.includes('provider')) {
    return WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED;
  } else if (errorMessage.includes('nonce')) {
    return WALLET_ERROR_MESSAGES.NONCE_MISMATCH;
  } else if (errorMessage.includes('underpriced')) {
    return WALLET_ERROR_MESSAGES.GAS_UNDERPRICED;
  } else {
    return `${WALLET_ERROR_MESSAGES.GENERAL_ERROR} (${errorMessage.slice(0, 100)}...)`;
  }
};

// Robust provider and signer retrieval
const getProviderAndSigner = async () => {
  try {
    // Wait for window.ethereum to be injected (timeout after ~5 seconds)
    const waitForEthereum = () =>
      new Promise((resolve, reject) => {
        if (window.ethereum) return resolve(true);
        let attempts = 0;

        const interval = setInterval(() => {
          if (window.ethereum) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts >= 10) {
            clearInterval(interval);
            reject(new Error(WALLET_ERROR_MESSAGES.METAMASK_NOT_FOUND));
          }

          attempts++;
        }, 500);
      });

    await waitForEthereum();

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Explicitly request account access if not connected
    let accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        accounts = await provider.listAccounts();
      } catch (err) {
        throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);
      }
    }

    // Verify Arbitrum network
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== ARBITRUM_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${ARBITRUM_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError) {
        throw new Error(WALLET_ERROR_MESSAGES.CHAIN_MISMATCH);
      }
    }

    const signer = await provider.getSigner();

    
return { provider, signer };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Initialize contracts with pre-flight checks
const getContracts = async () => {
  try {
    const { provider, signer } = await getProviderAndSigner();

    if (!LPA || !LBA || !LOA) {
      throw new Error('Contract addresses are not defined');
    }

    // Pre-flight check: Ensure wallet is still connected
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);
    }

    const libraryProtocol = new ethers.Contract(LPA, LibraryProtocolABI, signer);
    const libraryBook = new ethers.Contract(LBA, libraryBookABI, signer);
    const libraryOwner = new ethers.Contract(LOA, libraryOwnerABI, signer);

    return { provider, libraryProtocol, libraryBook, libraryOwner };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Type definitions (unchanged)
export type CuratorRegistrationData = { name: string };
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
export type BorrowBookData = { bookId: string; borrowDate: number; returnDate: number };
export type BorrowingStatus = 'Preparing' | 'Dispatched' | 'Delivered' | 'Returned' | 'Declined';
export type BorrowingLog = {
  borrowingId: string;
  wallet: string;
  status: BorrowingStatus;
  message?: string;
  createdAt: Date;
};
export type BorrowBookRequest = { borrowingId?: string; message: string; status: BorrowingStatus };
export type BookRequest = {
  title: string;
  author: string;
  additionalNotes: string;
  curatorId: string;
  status: string;
  isbn: string;
};
export type BookRequestLog = { requestId: string; status: string; message: string };

// Register curator with dynamic gas estimation
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
    const { provider, libraryProtocol } = await getContracts();
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);

    const value = ethers.parseEther(curatorPlatformFee);
    const gasEstimate = await libraryProtocol.getFunction('registerCurator').estimateGas(data.name, metadataCID, { value });

    const tx = await libraryProtocol.registerCurator(data.name, metadataCID, {
      gasLimit: gasEstimate * 120n / 100n, // 20% buffer
      value,
    });

    const receipt = await tx.wait();

    if (!receipt || !receipt.logs) throw new Error('Transaction failed: No logs found');

    const abi = [
      'event LibraryOwnerRegistered(string uniqueId, address indexed wallet, string name, uint256 libraryTokenId, string metadataCID)',
    ];

    const iface = new ethers.Interface(abi);

    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });

        if (parsedLog && parsedLog.name === 'LibraryOwnerRegistered') {
          return {
            success: true,
            uniqueId: parsedLog.args.uniqueId,
            hash: receipt.hash,
            nftTokenId: parsedLog.args.libraryTokenId.toString(),
            name: parsedLog.args.name,
            metadataCID: parsedLog.args.metadataCID,
          };
        }
      } catch (error) {
        console.error('Error decoding log:', error);
      }
    }

    return { success: true, hash: receipt.hash };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Add book with dynamic gas estimation
export const addBook = async (
  data: BookData
): Promise<{ success: boolean; uniqueId?: string; hash?: string; nftTokenId?: string }> => {
  try {
    const { provider, libraryProtocol } = await getContracts();
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);

    const gasEstimate = await libraryProtocol.getFunction('addBook').estimateGas(
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
      { gasLimit: gasEstimate * 120n / 100n }
    );

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) throw new Error('Transaction failed: No logs found');

    const abi = [
      'event BookAdded(string uniqueId, string title, string libraryOwnerId, uint256 isbn, uint256 bookTokenId, uint256 libraryTokenId, uint256 copies, string metadataCID)',
    ];

    const iface = new ethers.Interface(abi);

    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);

        if (parsedLog && parsedLog.name === 'BookAdded') {
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

    return { success: true, hash: receipt.hash };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Book request with dynamic gas
export const bookRequest = async (
  data: BookRequest
): Promise<{ success: boolean; requestId?: string; uniqueId?: string; hash?: string }> => {
  try {
    const { provider, libraryProtocol } = await getContracts();
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);

    const gasEstimate = await libraryProtocol.getFunction('addBookRequest').estimateGas(
      data.title,
      data.author,
      data.additionalNotes,
      data.curatorId,
      data.status,
      data.isbn
    );

    const tx = await libraryProtocol.addBookRequest(
      data.title,
      data.author,
      data.additionalNotes,
      data.curatorId,
      data.status,
      data.isbn,
      { gasLimit: gasEstimate * 120n / 100n }
    );

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) throw new Error('Transaction failed');

    const abi = [
      'event BookRequestAdded(string id, address wallet, uint256 isbn, string title, string author, string libraryOwnerId, string status)',
    ];

    const iface = new ethers.Interface(abi);

    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {
          return {
            success: true,
            requestId: parsedLog.args.id,
            hash: receipt.hash,
          };
        }
      } catch (error) {
        console.error('Error decoding log:', error);
      }
    }

    return { success: true, hash: receipt.hash };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Book request confirmation
export const bookRequestConfirmation = async (data: BookRequestLog): Promise<{ success: boolean }> => {
  try {
    const { provider, libraryProtocol } = await getContracts();
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);

    const gasEstimate = await libraryProtocol.getFunction('addBookRequestLog').estimateGas(
      data.requestId,
      data.status,
      data.message
    );

    const tx = await libraryProtocol.addBookRequestLog(data.requestId, data.status, data.message, {
      gasLimit: gasEstimate * 120n / 100n,
    });

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) throw new Error('Transaction failed');

    return { success: true };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Borrow book request
export const borrowBookRequest = async (
  data: BorrowBookData
): Promise<{ success: boolean; borrowingId?: string; hash?: string }> => {
  try {
    const { provider, libraryProtocol } = await getContracts();
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);

    const gasEstimate = await libraryProtocol.getFunction('addBorrowBook').estimateGas(
      data.bookId,
      data.borrowDate,
      data.returnDate
    );

    const tx = await libraryProtocol.addBorrowBook(data.bookId, data.borrowDate, data.returnDate, {
      gasLimit: gasEstimate * 120n / 100n,
    });

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) throw new Error('Transaction failed');

    const abi = [
      'event BookBorrowed(string borrowingId, string bookId, string bookTitle, string libraryOwnerId, address borrower, uint256 borrowDate, uint256 returnDate)',
    ];

    const iface = new ethers.Interface(abi);

    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);

        if (parsedLog) {
          return {
            success: true,
            borrowingId: parsedLog.args.borrowingId,
            hash: receipt.hash,
          };
        }
      } catch (error) {
        console.error('Error decoding log:', error);
      }
    }

    return { success: true, hash: receipt.hash };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Borrow book request log and confirmation
export const borrowBookRequestLogAndConfirmation = async (
  data: BorrowBookRequest
): Promise<{ success: boolean }> => {
  try {
    const { provider, libraryProtocol } = await getContracts();
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) throw new Error(WALLET_ERROR_MESSAGES.WALLET_DISCONNECTED);

    const gasEstimate = await libraryProtocol.getFunction('addBorrowBookLog').estimateGas(
      data.borrowingId,
      data.status,
      data.message
    );

    const tx = await libraryProtocol.addBorrowBookLog(data.borrowingId, data.status, data.message, {
      gasLimit: gasEstimate * 120n / 100n,
    });

    const receipt: TransactionReceipt = await tx.wait();

    if (!receipt || !receipt.logs) throw new Error('Transaction failed');

    return { success: true };
  } catch (error) {
    const errorMessage = handleWalletError(error);

    throw new Error(errorMessage);
  }
};

// Optional: Listen for wallet events (add this in your app initialization)
if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) console.warn('Wallet disconnected!');
  });
  window.ethereum.on('chainChanged', (chainId: string) => {
    console.log('Chain changed to:', chainId);
  });
}
