// utils/pinataUtils.ts
'use server';

import { PinataSDK } from 'pinata-web3';

// Initialize Pinata SDK with JWT from environment variables
const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: 'black-raw-narwhal-2.mypinata.cloud', // Your custom gateway
});

/**
 * Converts a base64-encoded image string to a File object
 * @param base64Image Base64-encoded image string (e.g., "data:image/png;base64,...")
 * @param name Name to use for generating the filename
 * @returns File object ready for Pinata upload
 */
function base64ToFile(base64Image: string, name: string): File {
    const fileName = `${name.replace(/\s+/g, '_').toLowerCase()}.png`; // Replace spaces with underscores, lowercase
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, ''); // Remove base64 prefix
    const buffer = Buffer.from(base64Data, 'base64'); // Convert to buffer
    const blob = new Blob([buffer], { type: 'image/png' }); // Create Blob

    
return new File([blob], fileName, { type: 'image/png' }); // Create File
}

/**
 * Uploads an image file to Pinata and returns the IPFS hash (CID)
 * @param imageFile Base64-encoded image string
 * @returns IPFS hash (CID) of the uploaded image
 */
async function uploadImageToPinata(imageFile: File): Promise<string> {
    try {
        const result = await pinata.upload.file(imageFile);

        
return result.IpfsHash; // e.g., "QmImageCID"
    } catch (error) {
        throw new Error(`Failed to upload image to Pinata: ${(error as Error).message}`);
    }
}

/**
 * Creates and uploads metadata to Pinata, conforming to ERC721 or ERC1155 standards
 * @param metadata Metadata object (ERC721 or ERC1155 format)
 * @returns IPFS hash (CID) of the uploaded metadata
 */
async function uploadMetadataToPinata(metadata: Record<string, any>): Promise<string> {
    try {
        const result = await pinata.upload.json(metadata);

        
return result.IpfsHash; // e.g., "QmMetadataCID"
    } catch (error) {
        throw new Error(`Failed to upload metadata to Pinata: ${(error as Error).message}`);
    }
}

// Helper function for curator metadata (ERC721)
async function createCuratorMetadata(name: string, base64Image: string): Promise<{ metadataCID: string; imageCID: string }> {
    // Convert base64 to File (not needed for upload.base64, but kept for consistency if needed elsewhere)
    const imageFile = base64ToFile(base64Image, name);

    // Upload base64 image directly
    const imageCID = await uploadImageToPinata(imageFile);

    const metadata = {
        name: `Library Curator - ${name}`,
        description: "A curator token for the Library Protocol system.",
        image: `ipfs://${imageCID}`,
        attributes: [
            { trait_type: "Name", value: name },
            { trait_type: "Verified", value: "false" },
        ],
    };

    const metadataCID = await uploadMetadataToPinata(metadata);

    
return { metadataCID, imageCID };
}

// Helper function for book metadata (ERC1155)
async function createBookMetadata(
    title: string,
    author: string,
    publisher: string,
    publishDate: string,
    pagination: number,
    isbn: string,
    copies: number,
    coverImage: string
): Promise<{ metadataCID: string; imageCID: string }> {
    const imageFile = base64ToFile(coverImage, title);
    const imageCID = await uploadImageToPinata(imageFile);

    const metadata = {
        name: title,
        description: `A book token representing ${title} by ${author}.`,
        image: `ipfs://${imageCID}`,
        properties: {
            author,
            publisher,
            publishDate,
            pagination,
            isbn,
            copies,
        },
    };

    const metadataCID = await uploadMetadataToPinata(metadata);

    
return { metadataCID, imageCID };
}

export { base64ToFile, uploadImageToPinata, uploadMetadataToPinata, createCuratorMetadata, createBookMetadata };
