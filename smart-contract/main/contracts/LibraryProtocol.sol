// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LibraryBookContract.sol";
import "./LibraryOwnerContract.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract LibraryProtocol is Initializable, OwnableUpgradeable {
    LibraryOwnerContract public libraryOwnerContract;
    LibraryBookContract public libraryBookContract;
    address public treasuryAddress;
    uint256 public minimumCuratorFee;

    uint256[5000] private __gap;

    event TreasuryAddressUpdated(address indexed newTreasury);
    event PaymentReceived(address indexed from, uint256 amount, string action);

    function initialize(
        address libraryAddress,
        address bookAddress,
        address _treasuryAddress
    ) public initializer {
        __Ownable_init(msg.sender);
        require(_treasuryAddress != address(0), "Invalid treasury address");
        libraryOwnerContract = LibraryOwnerContract(libraryAddress);
        libraryBookContract = LibraryBookContract(bookAddress);
        treasuryAddress = _treasuryAddress;
        minimumCuratorFee = 0; // Set to 0 (no minimum fee required)
        emit TreasuryAddressUpdated(_treasuryAddress);
    }

    function getLibraryOwnerContract()
        external
        view
        returns (LibraryOwnerContract)
    {
        return libraryOwnerContract;
    }

    function getLibraryBookContract()
        external
        view
        returns (LibraryBookContract)
    {
        return libraryBookContract;
    }

    function registerCurator(
        string memory _name,
        string memory _metadataCID
    ) external payable {
        require(
            msg.value >= minimumCuratorFee,
            "Insufficient payment for curator registration"
        ); // Will always pass if minimumCuratorFee is 0
        require(treasuryAddress != address(0), "Treasury address not set");

        libraryOwnerContract.registerAsLibraryOwner(_name, _metadataCID);

        if (msg.value > 0) {
            // Only transfer if value is sent
            (bool sent, ) = treasuryAddress.call{value: msg.value}("");
            require(sent, "Failed to send Ether to treasury");
            emit PaymentReceived(msg.sender, msg.value, "registerCurator");
        }
    }

    function addBook(
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
        libraryBookContract.addBook(
            msg.sender,
            _title,
            _author,
            _publisher,
            _publishDate,
            _pagination,
            _additionalNotes,
            _libraryOwnerId,
            _isbn,
            _copies,
            _metadataCID
        );
    }

    function addBookRequest(
        string memory _title,
        string memory _author,
        string memory _additionalNotes,
        string memory _libraryOwnerId,
        string memory _status,
        uint256 _isbn
    ) external {
        libraryBookContract.addBookRequest(
            msg.sender,
            _title,
            _author,
            _additionalNotes,
            _libraryOwnerId,
            _status,
            _isbn
        );
    }

    function addBookRequestLog(
        string memory _requestId,
        string memory _status,
        string memory _message
    ) external {
        libraryBookContract.addBookRequestLog(
            msg.sender,
            _requestId,
            _status,
            _message
        );
    }

    function addBorrowBook(
        string memory _bookId,
        uint256 _borrowDate,
        uint256 _returnDate
    ) external {
        libraryBookContract.addBorrowBook(
            msg.sender,
            _bookId,
            _borrowDate,
            _returnDate
        );
    }

    function addBorrowBookLog(
        string memory _borrowingId,
        string memory _status,
        string memory _message
    ) external {
        libraryBookContract.addBorrowBookLog(
            msg.sender,
            _borrowingId,
            _status,
            _message
        );
    }

    // Admin functions
    function setTreasuryAddress(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryAddress = _newTreasury;
        emit TreasuryAddressUpdated(_newTreasury);
    }

    function setMinimumFees(
        uint256 _curatorFee,
        uint256 /*_bookFee*/
    ) external onlyOwner {
        minimumCuratorFee = _curatorFee; // Allows admin to change it later
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool sent, ) = msg.sender.call{value: balance}("");
        require(sent, "Failed to withdraw Ether");
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value, "direct");
    }
}
