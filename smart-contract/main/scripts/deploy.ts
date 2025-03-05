import { ethers, upgrades } from 'hardhat';

async function main() {
    console.log('Deploying contracts...');

    const treasuryAddress = '0xA2Cf83c792cd80EF9A324348c488dCe698f3D6FB'; // Replace with actual treasury address
    console.log('Treasury address:', treasuryAddress);
    // Deploy LibraryOwnerContract
    const LibraryOwner = await ethers.getContractFactory('LibraryOwnerContract');
    const libraryOwner = await upgrades.deployProxy(LibraryOwner, [], { initializer: 'initialize' });
    await libraryOwner.waitForDeployment();
    console.log('LibraryOwner deployed to:', await libraryOwner.getAddress());

    // Deploy LibraryBookContract
    const LibraryBook = await ethers.getContractFactory('LibraryBookContract');
    const libraryBook = await upgrades.deployProxy(
        LibraryBook,
        [ethers.ZeroAddress],
        { initializer: 'initialize' }
    );
    await libraryBook.waitForDeployment();
    console.log('LibraryBook deployed to:', await libraryBook.getAddress());

    // Deploy LibraryProtocol with treasuryAddress
    const LibraryProtocol = await ethers.getContractFactory('LibraryProtocol');
    const libraryProtocol = await upgrades.deployProxy(
        LibraryProtocol,
        [
            await libraryOwner.getAddress(),
            await libraryBook.getAddress(),
            treasuryAddress, // Added treasuryAddress
        ],
        { initializer: 'initialize' }
    );
    await libraryProtocol.waitForDeployment();
    console.log('LibraryProtocol deployed to:', await libraryProtocol.getAddress());

    // Update LibraryBook with LibraryProtocol address
    const libraryBookInstance = await ethers.getContractAt('LibraryBookContract', await libraryBook.getAddress());
    await libraryBookInstance.updateLibraryProtocol(await libraryProtocol.getAddress());
    console.log('LibraryBook updated with LibraryProtocol address');

    // Transfer ownership
    await libraryBook.transferOwnership(await libraryProtocol.getAddress());
    await libraryOwner.transferOwnership(await libraryProtocol.getAddress());
    console.log('Ownership transferred to LibraryProtocol');

    console.log('✅ Deployment complete!');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});