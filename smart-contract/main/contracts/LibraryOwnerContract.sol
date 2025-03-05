// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LibraryOwnerContract is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable
{
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    struct LibraryOwner {
        string uniqueId;
        address wallet;
        string name;
        bool isVerified;
        uint256 libraryTokenId;
        string metadataCID; // Added to store the metadata CID
    }

    mapping(string => LibraryOwner) public libraryOwners;
    mapping(uint256 => string) private _tokenURIs; // Map tokenId to metadata CID
    uint256[5000] private __gap;

    event LibraryOwnerRegistered(
        string uniqueId,
        address indexed wallet,
        string name,
        uint256 libraryTokenId,
        string metadataCID
    );

    function initialize() public initializer {
        __ERC721_init("LibraryOwnerToken", "LOT");
        __Ownable_init(msg.sender);
        _baseTokenURI = "https://ipfs.io/ipfs/"; // Base URI for Pinata IPFS gateway
    }

    function generateUniqueId(
        address _wallet,
        uint256 _nonce
    ) internal view returns (string memory) {
        bytes32 hash = keccak256(
            abi.encodePacked(_wallet, _nonce, block.timestamp)
        );
        bytes
            memory alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        bytes memory uniqueId = new bytes(6);
        for (uint256 i = 0; i < 6; i++) {
            uniqueId[i] = alphabet[uint8(hash[i]) % alphabet.length];
        }
        return string(uniqueId);
    }

    // Updated to accept metadataCID
    function registerAsLibraryOwner(
        string memory _name,
        string memory _metadataCID
    ) external {
        require(bytes(_metadataCID).length > 0, "Metadata CID is required");

        string memory uniqueId = generateUniqueId(msg.sender, block.number);
        require(
            bytes(libraryOwners[uniqueId].name).length == 0,
            "LibraryOwner ID already exists"
        );

        uint256 libraryTokenId = _nextTokenId++;
        _mint(msg.sender, libraryTokenId);

        // Store the metadata CID
        _tokenURIs[libraryTokenId] = _metadataCID;

        libraryOwners[uniqueId] = LibraryOwner({
            uniqueId: uniqueId,
            wallet: msg.sender,
            name: _name,
            isVerified: false,
            libraryTokenId: libraryTokenId,
            metadataCID: _metadataCID
        });

        emit LibraryOwnerRegistered(
            uniqueId,
            msg.sender,
            _name,
            libraryTokenId,
            _metadataCID
        );
    }

    function getLibraryOwner(
        string memory _libraryOwnerId
    ) external view returns (LibraryOwner memory) {
        return libraryOwners[_libraryOwnerId];
    }

    // Updated tokenURI to use stored metadataCID
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        ownerOf(tokenId); // Check existence, reverts if token doesn't exist

        string memory cid = _tokenURIs[tokenId];
        require(bytes(cid).length > 0, "No metadata CID set for this token");

        return string(abi.encodePacked(_baseTokenURI, cid));
    }

    // Optional: Setter for base URI (admin only)
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }
}
