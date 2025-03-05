import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true 
    }
  },
  networks: {
    hardhat: {
      chainId: 31337, // Default chainId for Hardhat's local network
    },
    localhost: {
      url: "http://127.0.0.1:8545", // URL for the local Hardhat network
      chainId: 31337,
    },
    arbitrumSepolia: {
      url: process.env.ARBITRUM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrum: {
      url: process.env.ARBITRUM_MAIN_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],}
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;