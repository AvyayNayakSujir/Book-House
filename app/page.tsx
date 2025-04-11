"use client";
import { useState, useEffect } from "react";
import atm_abi from "../artifacts/contracts/BookStore.sol/BookStore.json";
import { ethers } from "ethers";
import contractConfig from "../contract-config.json";

// Replace the icon imports with simple components since you had issues with lucide-react
const IconComponent = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const icons = {
    BookOpen: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    ),
    ShoppingCart: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    Plus: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
    Search: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
    Wallet: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
      </svg>
    ),
    Loader2: () => (
      <svg
        className={`${className} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
    ),
    List: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    ),
    RefreshCw: () => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 2v6h-6"></path>
        <path d="M3 12a9 9 0 0 1 15-6.7l3 2.7"></path>
        <path d="M3 22v-6h6"></path>
        <path d="M21 12a9 9 0 0 1-15 6.7l-3-2.7"></path>
      </svg>
    ),
  };

  const Icon = icons[name as keyof typeof icons] || (() => <span>Icon</span>);
  return <Icon />;
};

declare global {
  interface Window {
    ethereum: any;
  }
}

// Book type definition
interface Book {
  id: number;
  title: string;
  author: string;
  price: string;
  stock: string;
}

// Hook to get all books
const useAllBooks = (contract: any) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllBooks = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      // Assuming the contract keeps track of a bookCount or similar
      const bookCount = await contract.getBookCount();
      const bookCountNumber = bookCount.toNumber();

      const fetchedBooks: Book[] = [];

      // Fetch each book by ID
      for (let i = 1; i <= bookCountNumber; i++) {
        try {
          const book = await contract.getBook(i);
          fetchedBooks.push({
            id: i,
            title: book[1],
            author: book[2],
            price: ethers.utils.formatEther(book[3]),
            stock: book[4].toString(),
          });
        } catch (error) {
          console.error(`Error fetching book ID ${i}:`, error);
          // Continue with the next book if one fails
        }
      }

      setBooks(fetchedBooks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching all books:", error);
      // If getBookCount fails, try alternative approach
      fetchBooksWithoutCount();
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative approach if getBookCount is not available
  const fetchBooksWithoutCount = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const fetchedBooks: Book[] = [];

      // Try fetching books until we get an error (assuming sequential IDs)
      let i = 1;
      let continueLoop = true;

      while (continueLoop && i <= 100) {
        // Limit to 100 to avoid infinite loop
        try {
          const book = await contract.getBook(i);
          fetchedBooks.push({
            id: i,
            title: book[1],
            author: book[2],
            price: ethers.utils.formatEther(book[3]),
            stock: book[4].toString(),
          });
          i++;
        } catch (error) {
          // Assuming error means we've reached the end of the books
          continueLoop = false;
        }
      }

      setBooks(fetchedBooks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use the appropriate fetch method based on contract capabilities
  const refreshBooks = async () => {
    try {
      // Try with bookCount first, fall back to alternative approach
      if (contract && typeof contract.getBookCount === "function") {
        await fetchAllBooks();
      } else if (contract) {
        await fetchBooksWithoutCount();
      }
    } catch (error) {
      console.error("Failed to refresh books:", error);
    }
  };

  // Effect to fetch books on contract change
  useEffect(() => {
    if (contract) {
      refreshBooks();

      // Set up polling for real-time updates (every 30 seconds)
      const intervalId = setInterval(refreshBooks, 30000);

      // Clean up on unmount
      return () => clearInterval(intervalId);
    }
  }, [contract]);

  return { books, isLoading, refreshBooks, lastUpdated };
};

// Purchase book hook
const usePurchase = (contract: any) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  async function purchaseBook(bookId: any, quantity: any) {
    try {
      setIsPurchasing(true);
      //@ts-ignore
      await window.ethereum.enable();

      const book = await contract.getBook(bookId);
      const pricePerBook = book[3]; // price in wei
      const totalPrice = pricePerBook.mul(quantity);

      const transaction = await contract.purchaseBook(bookId, quantity, {
        value: totalPrice,
      });

      const receipt = await transaction.wait();
      console.log("Book purchased:", receipt);
      setIsPurchasing(false);
      return { success: true, message: "Book purchased successfully!" };
    } catch (error) {
      console.error("Error purchasing book:", error);
      setIsPurchasing(false);
      return { success: false, message: "Error purchasing book." };
    }
  }

  return { purchaseBook, isPurchasing };
};

// Add book hook
const useAddBook = (contract: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const addBook = async (title: any, author: any, price: any, stock: any) => {
    try {
      const priceAsNumber = parseFloat(price);
      const stockAsNumber = parseInt(stock);

      if (
        !title ||
        !author ||
        isNaN(priceAsNumber) ||
        isNaN(stockAsNumber) ||
        priceAsNumber <= 0 ||
        stockAsNumber <= 0
      ) {
        return { success: false, message: "Please enter valid book details." };
      }

      setIsLoading(true);
      await contract.addBook(
        title,
        author,
        ethers.utils.parseEther(price),
        stock
      );
      setIsLoading(false);
      return { success: true, message: "Book added successfully!" };
    } catch (error) {
      console.error("Error adding book:", error);
      setIsLoading(false);
      return { success: false, message: "Error adding book." };
    }
  };

  return { addBook, isLoading };
};

// Get book hook
const useGetBook = (contract: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const getBook = async (bookId: any) => {
    try {
      setIsLoading(true);
      const book = await contract.getBook(bookId);
      setIsLoading(false);
      return {
        title: book[1],
        author: book[2],
        price: ethers.utils.formatEther(book[3]),
        stock: book[4].toString(),
      };
    } catch (error) {
      console.error("Error getting book:", error);
      setIsLoading(false);
      return null;
    }
  };

  return { isLoading, getBook };
};

// Format wallet address helper
const formatAddress = (address: string) => {
  return address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";
};

export default function Home() {
  const contractAddress = contractConfig.contractAddress || "";
  const contractABI = atm_abi.abi;

  const [contract, setContract] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [notification, setNotification] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Book interaction state
  const [bookIdPurchase, setBookIdPurchase] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [bookIdGet, setBookIdGet] = useState(0);
  const [bookDataAdd, setBookDataAdd] = useState({
    title: "",
    author: "",
    price: "",
    stock: "",
  });
  const [bookDataGet, setBookDataGet] = useState({
    title: "",
    author: "",
    price: "",
    stock: "",
  });

  // Custom hooks
  const { purchaseBook, isPurchasing } = usePurchase(contract);
  const { addBook, isLoading: isAddingBook } = useAddBook(contract);
  const { isLoading: isBookLoading, getBook } = useGetBook(contract);
  const {
    books,
    isLoading: isLoadingBooks,
    refreshBooks,
    lastUpdated,
  } = useAllBooks(contract);

  // Notification handler
  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Connect to blockchain
  const connectToContract = async () => {
    try {
      if (!contractAddress) {
        throw new Error("Contract address is not defined");
      }
      
      setIsConnecting(true);
      //@ts-ignore
      await window.ethereum.enable();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contract);
      setIsConnecting(false);
      showNotification("success", "Connected to BookStore contract!");
    } catch (error) {
      console.error("Error connecting to the contract:", error);
      setIsConnecting(false);
      showNotification(
        "error",
        "Failed to connect. Make sure MetaMask is installed and unlocked."
      );
    }
  };

  // Book handlers
  const handlePurchase = async () => {
    if (bookIdPurchase > 0 && quantity > 0) {
      const result = await purchaseBook(bookIdPurchase, quantity);
      showNotification(result.success ? "success" : "error", result.message);
      if (result.success) {
        refreshBooks(); // Refresh book list after purchase
      }
    } else {
      showNotification("error", "Enter valid book ID and quantity.");
    }
  };

  const handleAddBook = async () => {
    const result = await addBook(
      bookDataAdd.title,
      bookDataAdd.author,
      bookDataAdd.price,
      bookDataAdd.stock
    );
    showNotification(result.success ? "success" : "error", result.message);
    if (result.success) {
      setBookDataAdd({
        title: "",
        author: "",
        price: "",
        stock: "",
      });
      refreshBooks(); // Refresh book list after adding
    }
  };

  const handleGetBook = async () => {
    try {
      const book = await getBook(bookIdGet);
      if (book) {
        setBookDataGet({
          title: book.title,
          author: book.author,
          price: book.price.toString(),
          stock: book.stock.toString(),
        });
        showNotification("success", "Book details retrieved!");
      } else {
        showNotification("error", "Book not found");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Error fetching book details");
    }
  };

  // Filter and sort books
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const aValue = a[sortBy as keyof Book];
    const bValue = b[sortBy as keyof Book];

    if (sortBy === "price") {
      return sortOrder === "asc"
        ? parseFloat(aValue as string) - parseFloat(bValue as string)
        : parseFloat(bValue as string) - parseFloat(aValue as string);
    }

    if (sortBy === "stock") {
      return sortOrder === "asc"
        ? parseInt(aValue as string) - parseInt(bValue as string)
        : parseInt(bValue as string) - parseInt(aValue as string);
    }

    if (sortBy === "id") {
      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }

    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 ease-in-out ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <IconComponent
              name="BookOpen"
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
            />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Blockchain BookStore
            </h1>
          </div>

          {walletAddress ? (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4">
              <IconComponent
                name="Wallet"
                className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {formatAddress(walletAddress)}
              </span>
            </div>
          ) : (
            <button
              onClick={connectToContract}
              disabled={isConnecting}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {isConnecting ? (
                <IconComponent name="Loader2" className="h-4 w-4" />
              ) : (
                <IconComponent name="Wallet" className="h-4 w-4" />
              )}
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!contract && (
          <div className="text-center py-20">
            <IconComponent
              name="BookOpen"
              className="h-16 w-16 mx-auto text-blue-500 mb-4"
            />
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to the Blockchain BookStore
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Connect your wallet to start exploring, purchasing, and managing
              books on the blockchain.
            </p>
            <button
              onClick={connectToContract}
              disabled={isConnecting}
              className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              {isConnecting ? (
                <IconComponent name="Loader2" className="h-5 w-5" />
              ) : (
                <IconComponent name="Wallet" className="h-5 w-5" />
              )}
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          </div>
        )}

        {contract && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg gap-8 mb-16">
              {/* Purchase Book Card */}
              <div
                id="purchase-section"
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-[1.01]"
              >
                <div className="bg-blue-600 p-4">
                  <h2 className="text-white text-xl font-semibold flex items-center">
                    <IconComponent
                      name="ShoppingCart"
                      className="h-5 w-5 mr-2"
                    />
                    Purchase Book
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="bookId"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Book ID
                      </label>
                      <input
                        type="number"
                        id="bookId"
                        value={bookIdPurchase}
                        onChange={(e) =>
                          setBookIdPurchase(Math.max(0, Number(e.target.value)))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                      />
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      {isPurchasing ? (
                        <>
                          <IconComponent
                            name="Loader2"
                            className="h-4 w-4 mr-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <IconComponent
                            name="ShoppingCart"
                            className="h-4 w-4 mr-2"
                          />
                          Purchase
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Book Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-[1.01]">
                <div className="bg-green-600 p-4">
                  <h2 className="text-white text-xl font-semibold flex items-center">
                    <IconComponent name="Plus" className="h-5 w-5 mr-2" />
                    Add New Book
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={bookDataAdd.title}
                        onChange={(e) =>
                          setBookDataAdd({
                            ...bookDataAdd,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="author"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Author
                      </label>
                      <input
                        type="text"
                        id="author"
                        value={bookDataAdd.author}
                        onChange={(e) =>
                          setBookDataAdd({
                            ...bookDataAdd,
                            author: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Price (ETH)
                      </label>
                      <input
                        type="number"
                        id="price"
                        value={bookDataAdd.price}
                        step="0.0001"
                        onChange={(e) =>
                          setBookDataAdd({
                            ...bookDataAdd,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="stock"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Stock
                      </label>
                      <input
                        type="number"
                        id="stock"
                        value={bookDataAdd.stock}
                        onChange={(e) =>
                          setBookDataAdd({
                            ...bookDataAdd,
                            stock: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                      />
                    </div>

                    <button
                      onClick={handleAddBook}
                      disabled={isAddingBook}
                      className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      {isAddingBook ? (
                        <>
                          <IconComponent
                            name="Loader2"
                            className="h-4 w-4 mr-2"
                          />
                          Adding...
                        </>
                      ) : (
                        <>
                          <IconComponent name="Plus" className="h-4 w-4 mr-2" />
                          Add Book
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Listing Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mt-12">
              <div className="bg-indigo-600 p-4 flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold flex items-center">
                  <IconComponent name="List" className="h-5 w-5 mr-2" />
                  Available Books
                </h2>
                <div className="flex items-center">
                  <button
                    onClick={refreshBooks}
                    className="flex items-center space-x-1 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-md text-sm"
                    disabled={isLoadingBooks}
                  >
                    <IconComponent
                      name="RefreshCw"
                      className={`h-4 w-4 mr-1 ${
                        isLoadingBooks ? "animate-spin" : ""
                      }`}
                    />
                    <span>Refresh</span>
                  </button>
                  {lastUpdated && (
                    <span className="text-xs text-indigo-100 ml-3">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                {/* Search and Filter */}
                <div className="mb-4 flex items-center">
                  <div className="relative flex-1">
                    <IconComponent
                      name="Search"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search books by title or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Books Table */}
                {isLoadingBooks ? (
                  <div className="flex justify-center items-center py-12">
                    <IconComponent
                      name="Loader2"
                      className="h-8 w-8 text-indigo-500"
                    />
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      Loading books...
                    </span>
                  </div>
                ) : sortedBooks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort("id")}
                          >
                            <div className="flex items-center">
                              ID
                              {sortBy === "id" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort("title")}
                          >
                            <div className="flex items-center">
                              Title
                              {sortBy === "title" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort("author")}
                          >
                            <div className="flex items-center">
                              Author
                              {sortBy === "author" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort("price")}
                          >
                            <div className="flex items-center">
                              Price (ETH)
                              {sortBy === "price" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSort("stock")}
                          >
                            <div className="flex items-center">
                              Stock
                              {sortBy === "stock" && (
                                <span className="ml-1">
                                  {sortOrder === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedBooks.map((book) => (
                          <tr
                            key={book.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {book.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {book.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {book.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {book.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {book.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => {
                                  setBookIdPurchase(book.id);
                                  setQuantity(1);
                                  document
                                    .getElementById("purchase-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                              >
                                Buy
                              </button>
                              <button
                                onClick={() => {
                                  setBookIdGet(book.id);
                                  handleGetBook();
                                  document
                                    .getElementById("details-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "No books match your search criteria."
                        : "No books found in the bookstore."}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="bg-white dark:bg-gray-800 mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Blockchain BookStore &copy; {new Date().getFullYear()} | Built with
          Next.js and Ethereum
        </div>
      </footer>
    </main>
  );
}
