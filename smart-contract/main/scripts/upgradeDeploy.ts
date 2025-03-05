import { ethers, upgrades } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (!process.env.PRIVATE_KEY || !process.env.ARBITRUM_RPC_URL || !process.env.EXISTING_CONTRACT_ADDRESS) {
        throw new Error("Please set PRIVATE_KEY, ARBITRUM_RPC_URL, and EXISTING_CONTRACT_ADDRESS in your .env file");
    }

    console.log(`Upgrading LibraryProtocol at ${process.env.EXISTING_CONTRACT_ADDRESS}...`);

    const LibraryProtocol = await ethers.getContractFactory("LibraryProtocol");
    const libraryProtocol = await upgrades.upgradeProxy(process.env.EXISTING_CONTRACT_ADDRESS, LibraryProtocol);

    await libraryProtocol.waitForDeployment();
    console.log(`LibraryProtocol upgraded at: ${await libraryProtocol.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
