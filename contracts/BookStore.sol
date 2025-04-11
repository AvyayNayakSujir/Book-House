// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookStore {
    address public owner;
    uint256 public bookIdCounter;

    struct Book {
        uint256 id;
        string title;
        string author;
        uint256 price;
        uint256 stock;
        address owner;
        address payable authorWallet;
    }

    struct UserPurchase {
        uint256 bookId;
        uint256 quantity;
        uint256 timestamp;
    }

    mapping(uint256 => Book) public books;
    mapping(address => UserPurchase[]) public userPurchases;

    event BookAdded(uint256 bookId);
    event BookPurchased(uint256 bookId, uint256 quantity, address buyer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        bookIdCounter = 0;
    }

    function addBook(
        string memory _title,
        string memory _author,
        uint256 _price,
        uint256 _stock,
        address payable _authorWallet
    ) external {
        bookIdCounter++;
        books[bookIdCounter] = Book(
            bookIdCounter,
            _title,
            _author,
            _price,
            _stock,
            msg.sender,
            _authorWallet
        );
        emit BookAdded(bookIdCounter);
    }

    function purchaseBook(uint256 _bookId, uint256 _quantity) external payable {
        require(_quantity > 0, "Quantity must be greater than 0");
        require(books[_bookId].id != 0, "Invalid book ID");
        require(books[_bookId].stock >= _quantity, "Insufficient stock");
        require(
            msg.value >= books[_bookId].price * _quantity,
            "Insufficient funds"
        );
        require(
            msg.sender != books[_bookId].owner,
            "You cannot purchase your own book"
        );
        
        // Calculate the exact payment amount
        uint256 paymentAmount = books[_bookId].price * _quantity;
        
        // Update book stock
        books[_bookId].stock -= _quantity;

        // Record the purchase for this user
        userPurchases[msg.sender].push(
            UserPurchase({
                bookId: _bookId,
                quantity: _quantity,
                timestamp: block.timestamp
            })
        );

        // Transfer payment to the author's wallet
        books[_bookId].authorWallet.transfer(paymentAmount);

        emit BookPurchased(_bookId, _quantity, msg.sender);

        // Refund excess payment if any
        if (msg.value > paymentAmount) {
            payable(msg.sender).transfer(msg.value - paymentAmount);
        }
    }

    function getBook(uint256 _bookId)
        external
        view
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            address,
            address
        )
    {
        require(books[_bookId].id != 0, "Invalid book ID");
        Book memory book = books[_bookId];
        return (
            book.id,
            book.title,
            book.author,
            book.price,
            book.stock,
            book.owner,
            book.authorWallet
        );
    }

    function getBookCount() public view returns (uint256) {
        return bookIdCounter;
    }

    function getAllBooks() external view returns (Book[] memory) {
        uint256 totalBooks = bookIdCounter;
        uint256 currentIndex = 0;

        Book[] memory allBooks = new Book[](totalBooks);

        for (uint256 i = 1; i <= totalBooks; i++) {
            Book memory book = books[i];
            allBooks[currentIndex] = book;
            currentIndex++;
        }

        return allBooks;
    }

    // Get user's purchase history
    function getUserPurchases() external view returns (UserPurchase[] memory) {
        return userPurchases[msg.sender];
    }

    // Get detailed information about user's purchased books
    function getUserBooks()
        external
        view
        returns (
            uint256[] memory bookIds,
            string[] memory titles,
            string[] memory authors,
            uint256[] memory quantities,
            uint256[] memory timestamps
        )
    {
        UserPurchase[] memory purchases = userPurchases[msg.sender];
        uint256 purchaseCount = purchases.length;

        bookIds = new uint256[](purchaseCount);
        titles = new string[](purchaseCount);
        authors = new string[](purchaseCount);
        quantities = new uint256[](purchaseCount);
        timestamps = new uint256[](purchaseCount);

        for (uint256 i = 0; i < purchaseCount; i++) {
            UserPurchase memory purchase = purchases[i];
            Book memory book = books[purchase.bookId];

            bookIds[i] = purchase.bookId;
            titles[i] = book.title;
            authors[i] = book.author;
            quantities[i] = purchase.quantity;
            timestamps[i] = purchase.timestamp;
        }

        return (bookIds, titles, authors, quantities, timestamps);
    }
}