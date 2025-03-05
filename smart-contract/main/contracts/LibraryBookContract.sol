// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./LibraryProtocol.sol";

contract LibraryBookContract is
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable
{
    struct Book {
        string uniqueId;
        string title;
        string author;
        string publisher;
        string publishDate;
        uint256 pagination;
        string additionalNotes;
        bool availability;
        string libraryOwnerId;
        uint256 createdAt;
        uint256 isbn;
        uint256 bookTokenId;
        uint256 libraryTokenId;
        uint256 copies;
        string metadataCID; // Store metadata CID for each book
    }

    struct BookRequest {
        string id;
        address wallet;
        string title;
        string author;
        string additionalNotes;
        string libraryOwnerId;
        uint256 createdAt;
        string status;
        uint256 isbn;
    }

    struct BookRequestLog {
        string requestId;
        address wallet;
        string status;
        string message;
        uint256 createdAt;
    }

    struct Borrowing {
        string bookId;
        string bookTitle;
        string libraryOwnerId;
        address borrower;
        uint256 borrowDate;
        uint256 returnDate;
    }

    struct BorrowingLog {
        string borrowingId;
        address wallet;
        string libraryOwnerId;
        string status;
        string message;
        uint256 createdAt;
    }

    mapping(string => Book) public books;
    string[] public bookIds;
    uint256 private _nextTokenId;
    mapping(string => BookRequest) public bookRequest;
    mapping(string => BookRequestLog[]) public bookRequestLogs;
    mapping(string => Borrowing) public borrowings;
    mapping(string => BorrowingLog[]) public borrowingLogs;
    mapping(uint256 => string) private _tokenURIs; // Map tokenId to metadata CID
    string private _baseTokenURI; // Base URI for metadata

    LibraryProtocol public libraryProtocol;
    uint256[5000] private __gap;

    event BookAdded(
        string uniqueId,
        string title,
        string libraryOwnerId,
        uint256 isbn,
        uint256 bookTokenId,
        uint256 libraryTokenId,
        uint256 copies,
        string metadataCID
    );
    event BookRequestAdded(
        string id,
        address wallet,
        uint256 isbn,
        string title,
        string author,
        string libraryOwnerId,
        string status
    );
    event BookAvailabilityUpdated(string bookId, bool availability);
    event BookRequestLogAdded(
        string requestId,
        address wallet,
        string status,
        string message
    );
    event BookBorrowed(
        string borrowingId,
        string bookId,
        string bookTitle,
        string libraryOwnerId,
        address borrower,
        uint256 borrowDate,
        uint256 returnDate
    );
    event BorrowingLogAdded(
        string borrowingId,
        address wallet,
        string status,
        string message
    );

    function initialize(
        address payable _libraryProtocolAddress
    ) public initializer {
        __ERC1155_init(""); // Empty URI since we override with _baseTokenURI
        __Ownable_init(msg.sender);
        _nextTokenId = 1;
        libraryProtocol = LibraryProtocol(_libraryProtocolAddress);
        _baseTokenURI = "https://ipfs.io/ipfs/"; // Set default base URI
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

    function addBook(
        address minter,
        string memory _title,
        string memory _author,
        string memory _publisher,
        string memory _publishDate,
        uint256 _pagination,
        string memory _additionalNotes,
        string memory _libraryOwnerId,
        uint256 _isbn,
        uint256 _copies,
        string memory _metadataCID
    ) external {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_author).length > 0, "Author is required");
        require(_pagination > 0, "Invalid pagination count");
        require(_copies > 0, "Must mint at least one copy");
        require(bytes(_metadataCID).length > 0, "Metadata CID is required");

        string memory uniqueId = generateUniqueId(msg.sender, block.number);
        require(
            bytes(books[uniqueId].title).length == 0,
            "Book ID already exists"
        );

        LibraryOwnerContract.LibraryOwner memory libraryOwner = libraryProtocol
            .getLibraryOwnerContract()
            .getLibraryOwner(_libraryOwnerId);
        require(
            bytes(libraryOwner.uniqueId).length != 0,
            "Invalid library owner ID"
        );

        uint256 libraryTokenId = libraryOwner.libraryTokenId;
        uint256 bookTokenId = _nextTokenId++;
        _mint(minter, bookTokenId, _copies, "");

        // Store metadata CID
        _tokenURIs[bookTokenId] = _metadataCID;

        books[uniqueId] = Book({
            uniqueId: uniqueId,
            title: _title,
            author: _author,
            publisher: _publisher,
            publishDate: _publishDate,
            pagination: _pagination,
            additionalNotes: _additionalNotes,
            availability: true,
            libraryOwnerId: _libraryOwnerId,
            createdAt: block.timestamp,
            isbn: _isbn,
            bookTokenId: bookTokenId,
            libraryTokenId: libraryTokenId,
            copies: _copies,
            metadataCID: _metadataCID
        });

        bookIds.push(uniqueId);
        emit BookAdded(
            uniqueId,
            _title,
            _libraryOwnerId,
            _isbn,
            bookTokenId,
            libraryTokenId,
            _copies,
            _metadataCID
        );
    }

    function addBookRequest(
        address minter,
        string memory _title,
        string memory _author,
        string memory _additionalNotes,
        string memory _libraryOwnerId,
        string memory _status,
        uint256 _isbn
    ) external {
        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_author).length > 0, "Author is required");
        require(
            keccak256(bytes(_status)) == keccak256(bytes("Pending")) ||
                keccak256(bytes(_status)) == keccak256(bytes("Approved")) ||
                keccak256(bytes(_status)) == keccak256(bytes("Rejected")),
            "Invalid status"
        );

        LibraryOwnerContract.LibraryOwner memory libraryOwner = libraryProtocol
            .getLibraryOwnerContract()
            .getLibraryOwner(_libraryOwnerId);
        require(
            bytes(libraryOwner.uniqueId).length != 0,
            "Invalid library owner ID"
        );

        string memory requestId = generateUniqueId(msg.sender, block.number);
        bookRequest[requestId] = BookRequest({
            id: requestId,
            wallet: minter,
            title: _title,
            author: _author,
            additionalNotes: _additionalNotes,
            libraryOwnerId: _libraryOwnerId,
            createdAt: block.timestamp,
            status: _status,
            isbn: _isbn
        });

        emit BookRequestAdded(
            requestId,
            minter,
            _isbn,
            _title,
            _author,
            _libraryOwnerId,
            _status
        );
    }

    function addBookRequestLog(
        address minter,
        string memory _requestId,
        string memory _status,
        string memory _message
    ) external {
        require(
            bytes(bookRequest[_requestId].title).length > 0,
            "Book request does not exist"
        );

        bookRequestLogs[_requestId].push(
            BookRequestLog({
                requestId: _requestId,
                wallet: minter,
                status: _status,
                message: _message,
                createdAt: block.timestamp
            })
        );

        emit BookRequestLogAdded(_requestId, minter, _status, _message);
    }

    function addBorrowBook(
        address sender,
        string memory _bookId,
        uint256 _borrowDate,
        uint256 _returnDate
    ) external {
        require(bytes(books[_bookId].title).length > 0, "Book does not exist");
        require(books[_bookId].availability, "Book is not available");
        require(_returnDate > _borrowDate, "Invalid return date");

        string memory libraryOwnerId = books[_bookId].libraryOwnerId;
        string memory borrowingId = generateUniqueId(sender, block.number);

        borrowings[borrowingId] = Borrowing({
            bookId: _bookId,
            bookTitle: books[_bookId].title,
            libraryOwnerId: libraryOwnerId,
            borrower: sender,
            borrowDate: _borrowDate,
            returnDate: _returnDate
        });

        emit BookBorrowed(
            borrowingId,
            _bookId,
            books[_bookId].title,
            libraryOwnerId,
            sender,
            _borrowDate,
            _returnDate
        );
    }

    function addBorrowBookLog(
        address sender,
        string memory _borrowingId,
        string memory _status,
        string memory _message
    ) external {
        require(
            bytes(borrowings[_borrowingId].bookId).length > 0,
            "Borrowing record does not exist"
        );

        string memory libraryOwnerId = borrowings[_borrowingId].libraryOwnerId;
        string memory bookId = borrowings[_borrowingId].bookId;

        if (borrowingLogs[_borrowingId].length == 0) {
            books[bookId].availability = false;
            emit BookAvailabilityUpdated(bookId, false);
        }

        borrowingLogs[_borrowingId].push(
            BorrowingLog({
                borrowingId: _borrowingId,
                wallet: sender,
                libraryOwnerId: libraryOwnerId,
                status: _status,
                message: _message,
                createdAt: block.timestamp
            })
        );

        emit BorrowingLogAdded(_borrowingId, sender, _status, _message);
    }

    function updateLibraryProtocol(
        address payable _libraryProtocol
    ) external onlyOwner {
        require(
            _libraryProtocol != address(0),
            "Invalid library protocol address"
        );
        libraryProtocol = LibraryProtocol(_libraryProtocol);
    }

    // Override uri function to use _baseTokenURI
    function uri(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _nextTokenId > tokenId && tokenId > 0,
            "ERC1155: URI query for nonexistent token"
        );
        string memory cid = _tokenURIs[tokenId];
        require(bytes(cid).length > 0, "No metadata CID set for this token");
        return string(abi.encodePacked(_baseTokenURI, cid));
    }

    // Setter for base URI (admin only)
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        require(bytes(newBaseURI).length > 0, "New base URI cannot be empty");
        _baseTokenURI = newBaseURI;
    }
}
