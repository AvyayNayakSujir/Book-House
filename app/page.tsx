"use client";
import { useState, useEffect } from "react";
import atm_abi from "../artifacts/contracts/BookStore.sol/BookStore.json";
import { ethers } from "ethers";
import contractConfig from "../contract-config.json";
import Link from "next/link";
import IconComponent from "../public/components/IconComponent";
import {
  useAllBooks,
  usePurchase,
  useAddBook,
  useGetBook,
} from "@/public/components/hooks";
import Book from "@/public/components/IBook";
import { useWallet } from "@/contexts/WalletContext";

// Format wallet address helper
const formatAddress = (address: string) => {
  return address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";
};

// Component: Header
interface HeaderProps {
  walletAddress: string;
  isConnecting: boolean;
  connectToContract: () => Promise<void>;
}

const Header = ({
  walletAddress,
  isConnecting,
  connectToContract,
}: HeaderProps) => (
  <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <IconComponent
            name="BookOpen"
            className="h-8 w-8 text-blue-600 dark:text-blue-400"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Book House
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/purchased-books"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm"
          >
            <IconComponent name="BookOpen" className="h-4 w-4" />
            <span>My Purchases</span>
          </Link>

          {walletAddress ? (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 shadow-inner">
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
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
            >
              {isConnecting ? (
                <IconComponent
                  name="Loader2"
                  className="h-4 w-4 animate-spin"
                />
              ) : (
                <IconComponent name="Wallet" className="h-4 w-4" />
              )}
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);

// Component: WelcomeScreen
interface WelcomeScreenProps {
  connectToContract: () => Promise<void>;
  isConnecting: boolean;
}

const WelcomeScreen = ({
  connectToContract,
  isConnecting,
}: WelcomeScreenProps) => (
  <div className="text-center py-20 relative overflow-hidden rounded-xl">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 animate-gradient-x"></div>
    <div className="relative z-10 px-4 py-16">
      <IconComponent
        name="BookOpen"
        className="h-16 w-16 mx-auto text-blue-500 dark:text-blue-400 mb-4"
      />
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
        Welcome to Book House
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
        Connect your wallet to start exploring, purchasing, and managing books
        on the blockchain.
      </p>
      <button
        onClick={connectToContract}
        disabled={isConnecting}
        className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md"
      >
        {isConnecting ? (
          <IconComponent name="Loader2" className="h-5 w-5 animate-spin" />
        ) : (
          <IconComponent name="Wallet" className="h-5 w-5" />
        )}
        <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
      </button>
    </div>
  </div>
);

// Component: AddBookForm
interface BookDataAdd {
  title: string;
  author: string;
  price: string;
  stock: string;
  authorWallet: string;
}

interface AddBookFormProps {
  bookDataAdd: BookDataAdd;
  setBookDataAdd: React.Dispatch<React.SetStateAction<BookDataAdd>>;
  handleAddBook: () => Promise<void>;
  isAddingBook: boolean;
}

const AddBookForm = ({
  bookDataAdd,
  setBookDataAdd,
  handleAddBook,
  isAddingBook,
}: AddBookFormProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
    <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-4">
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
            placeholder="Enter book title"
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
            placeholder="Enter author name"
          />
        </div>

        {/* Author Wallet field */}
        <div>
          <label
            htmlFor="authorWallet"
            className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            <span>Author's Wallet Address</span>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
              Auto-filled
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="authorWallet"
              value={bookDataAdd.authorWallet}
              onChange={(e) =>
                setBookDataAdd({
                  ...bookDataAdd,
                  authorWallet: e.target.value,
                })
              }
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-700/60"
              placeholder="0x..."
              disabled={true}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IconComponent
                name="Wallet"
                className="h-4 w-4 text-gray-400 dark:text-gray-500"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Payments for book purchases will be sent to this address
          </p>
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Price (ETH)
          </label>
          <div className="relative">
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
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              min="0"
              placeholder="0.01"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">Ξ</span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Stock
          </label>
          <div className="relative">
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
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              min="1"
              placeholder="10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IconComponent
                name="BookOpen"
                className="h-4 w-4 text-gray-400 dark:text-gray-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleAddBook}
          className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-3 px-4 rounded-md transition-colors duration-200 shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isAddingBook ? (
            <>
              <IconComponent
                name="Loader2"
                className="h-5 w-5 mr-2 animate-spin"
              />
              <span className="font-medium">Adding Book...</span>
            </>
          ) : (
            <>
              <IconComponent name="Plus" className="h-5 w-5 mr-2" />
              <span className="font-medium">Add Book to Marketplace</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// Component: BooksList
interface BooksListProps {
  books: Book[];
  isLoadingBooks: boolean;
  refreshBooks: () => void;
  lastUpdated: Date | null;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  sortOrder: "asc" | "desc";
  handleSort: (column: string) => void;
  sortedBooks: Book[];
  setBookIdPurchase: React.Dispatch<React.SetStateAction<number>>;
  setSelectedBook: React.Dispatch<React.SetStateAction<Book | null>>;
  setIsPurchaseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  walletAddress: string;
}

const BooksList = ({
  books,
  isLoadingBooks,
  refreshBooks,
  lastUpdated,
  searchTerm,
  setSearchTerm,
  sortBy,
  sortOrder,
  handleSort,
  sortedBooks,
  setBookIdPurchase,
  setSelectedBook,
  setIsPurchaseModalOpen,
  walletAddress,
}: BooksListProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-12">
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 className="text-white text-xl font-semibold flex items-center">
        <IconComponent name="List" className="h-5 w-5 mr-2" />
        Available Books
      </h2>
      <div className="flex items-center">
        <button
          onClick={refreshBooks}
          className="flex items-center space-x-1 bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-sm shadow-sm"
          disabled={isLoadingBooks}
        >
          <IconComponent
            name="RefreshCw"
            className={`h-4 w-4 mr-1 ${isLoadingBooks ? "animate-spin" : ""}`}
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
      <div className="mb-4">
        <div className="relative w-full max-w-md">
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

      {/* Table or Loading/Empty states */}
      {isLoadingBooks ? (
        <div className="flex justify-center items-center py-12">
          <IconComponent
            name="Loader2"
            className="h-8 w-8 text-indigo-500 animate-spin"
          />
          <span className="ml-2 text-gray-600 dark:text-gray-300">
            Loading books...
          </span>
        </div>
      ) : sortedBooks.length > 0 ? (
        <BooksTable
          sortedBooks={sortedBooks}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          walletAddress={walletAddress}
          setBookIdPurchase={setBookIdPurchase}
          setSelectedBook={setSelectedBook}
          setIsPurchaseModalOpen={setIsPurchaseModalOpen}
        />
      ) : (
        <div className="text-center py-12">
          <IconComponent
            name="Search"
            className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4"
          />
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
);

// Component: BooksTable (sub-component of BooksList)
interface BooksTableProps {
  sortedBooks: Book[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  handleSort: (column: string) => void;
  walletAddress: string;
  setBookIdPurchase: React.Dispatch<React.SetStateAction<number>>;
  setSelectedBook: React.Dispatch<React.SetStateAction<Book | null>>;
  setIsPurchaseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BooksTable = ({
  sortedBooks,
  sortBy,
  sortOrder,
  handleSort,
  walletAddress,
  setBookIdPurchase,
  setSelectedBook,
  setIsPurchaseModalOpen,
}: BooksTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
        <tr>
          <SortableHeader
            column="id"
            label="ID"
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
          <SortableHeader
            column="title"
            label="Title"
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
          <SortableHeader
            column="author"
            label="Author"
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
          <SortableHeader
            column="price"
            label="Price (ETH)"
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
          <SortableHeader
            column="stock"
            label="Stock"
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
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
            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
              book.owner &&
              book.owner.toLowerCase() === walletAddress.toLowerCase()
                ? "bg-indigo-50/30 dark:bg-indigo-900/10"
                : ""
            }`}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-md">
                #{book.id}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {book.title}
              {book.owner &&
                book.owner.toLowerCase() === walletAddress.toLowerCase() && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <svg
                      className="-ml-0.5 mr-1.5 h-2 w-2 text-purple-600 dark:text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Your Book
                  </span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {book.author}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                {book.price} ETH
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span
                className={`px-2 py-1 rounded-md ${
                  parseInt(book.stock) > 5
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : parseInt(book.stock) > 0
                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                }`}
              >
                {book.stock}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {book.owner &&
              book.owner.toLowerCase() === walletAddress.toLowerCase() ? (
                <span
                  className="inline-flex items-center text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  title="You cannot purchase your own book"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Owner
                </span>
              ) : (
                <button
                  onClick={() => {
                    setBookIdPurchase(book.id);
                    setSelectedBook(book);
                    setIsPurchaseModalOpen(true);
                  }}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 transition-colors duration-150"
                  aria-label={`Buy ${book.title}`}
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Buy
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Component: SortableHeader (sub-component of BooksTable)
interface SortableHeaderProps {
  column: string;
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  handleSort: (column: string) => void;
}

const SortableHeader = ({
  column,
  label,
  sortBy,
  sortOrder,
  handleSort,
}: SortableHeaderProps) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 group"
    onClick={() => handleSort(column)}
    aria-sort={
      sortBy === column
        ? sortOrder === "asc"
          ? "ascending"
          : "descending"
        : "none"
    }
  >
    <div className="flex items-center">
      {label}
      {sortBy === column ? (
        <svg
          className="ml-1 h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {sortOrder === "asc" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          )}
        </svg>
      ) : (
        <svg
          className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16V4m0 0L3 8m4-4l4 4"
          />
        </svg>
      )}
    </div>
  </th>
);

// Component: Footer
const Footer = () => (
  <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
      Book House &copy; {new Date().getFullYear()} | All rights reserved
    </div>
  </footer>
);

// Main Component
export default function Home() {
  const {
    contract,
    walletAddress,
    isConnecting,
    isContractOwner,
    connectWallet,
  } = useWallet();

  const connectToContract = async () => {
    const result = await connectWallet();
    showNotification(result.success ? "success" : "error", result.message);
  };

  // State management
  const [notification, setNotification] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Book interaction state
  const [bookIdPurchase, setBookIdPurchase] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [bookIdGet, setBookIdGet] = useState(0);
  const [bookDataAdd, setBookDataAdd] = useState({
    title: "",
    author: "",
    price: "",
    stock: "",
    authorWallet: "",
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

  // Set author wallet when connected
  useEffect(() => {
    if (walletAddress) {
      setBookDataAdd((prev) => ({
        ...prev,
        authorWallet: walletAddress,
      }));
    }
  }, [walletAddress]);

  // Notification handler
  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Book action handlers
  const handlePurchase = async () => {
    if (bookIdPurchase > 0) {
      const bookToPurchase = books.find((book) => book.id === bookIdPurchase);

      // Check if the user is trying to buy their own book
      if (
        bookToPurchase &&
        bookToPurchase.owner &&
        bookToPurchase.owner.toLowerCase() === walletAddress.toLowerCase()
      ) {
        showNotification("error", "You cannot purchase your own book");
        return;
      }

      const result = await purchaseBook(bookIdPurchase);
      showNotification(result.success ? "success" : "error", result.message);
      if (result.success) {
        refreshBooks(); // Refresh book list after purchase
      }
    } else {
      showNotification("error", "Please select a book to purchase.");
    }
  };

  const handleAddBook = async () => {
    const result = await addBook(
      bookDataAdd.title,
      bookDataAdd.author,
      bookDataAdd.price,
      bookDataAdd.stock,
      bookDataAdd.authorWallet
    );
    showNotification(result.success ? "success" : "error", result.message);
    if (result.success) {
      setBookDataAdd({
        title: "",
        author: "",
        price: "",
        stock: "",
        authorWallet: "",
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
      // First check if book is in stock
      parseInt(book.stock) > 0 &&
      // Then apply the search filter
      (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Purchase Modal Component (already exists in your code)
  const PurchaseModal = () => {
    if (!isPurchaseModalOpen || !selectedBook) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-white text-xl font-semibold flex items-center">
                <IconComponent name="ShoppingCart" className="h-5 w-5 mr-2" />
                Purchase Book
              </h2>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Book Details */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {selectedBook.title}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                by {selectedBook.author}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                  {selectedBook.price} ETH
                </span>
                <span
                  className={`px-2 py-1 rounded-md ${
                    parseInt(selectedBook.stock) > 5
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                      : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                  }`}
                >
                  In stock: {selectedBook.stock}
                </span>
              </div>
            </div>

            {/* Info text */}
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">
              <div className="flex items-start">
                <IconComponent
                  name="Info"
                  className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  You will purchase one copy of this book. The payment will be
                  sent directly to the author's wallet.
                </div>
              </div>
            </div>

            {/* Warning for own books */}
            {selectedBook.owner &&
              selectedBook.owner.toLowerCase() ===
                walletAddress.toLowerCase() && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
                  <IconComponent
                    name="AlertTriangle"
                    className="h-5 w-5 flex-shrink-0"
                  />
                  <span>You cannot purchase your own book</span>
                </div>
              )}

            {/* Purchase Button */}
            <button
              onClick={() => {
                handlePurchase();
                setIsPurchaseModalOpen(false);
              }}
              disabled={
                isPurchasing ||
                (selectedBook.owner &&
                  selectedBook.owner.toLowerCase() ===
                    walletAddress.toLowerCase()) ||
                parseInt(selectedBook.stock) < 1
              }
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-md transition-colors duration-200 shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isPurchasing ? (
                <>
                  <IconComponent
                    name="Loader2"
                    className="h-4 w-4 mr-2 animate-spin"
                  />
                  Processing...
                </>
              ) : selectedBook.owner &&
                selectedBook.owner.toLowerCase() ===
                  walletAddress.toLowerCase() ? (
                <>Cannot Buy Own Book</>
              ) : (
                <>
                  <IconComponent name="ShoppingCart" className="h-4 w-4 mr-2" />
                  Purchase for {selectedBook.price} ETH
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Payments are sent directly to the author's wallet via the Ethereum
              blockchain
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-500 ease-in-out ${
            notification.type === "success"
              ? "bg-green-600/90 text-white dark:bg-green-600/80"
              : "bg-red-600/90 text-white dark:bg-red-600/80"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <Header
        walletAddress={walletAddress}
        isConnecting={isConnecting}
        connectToContract={connectToContract}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome screen if not connected */}
        {!contract && (
          <WelcomeScreen
            connectToContract={connectToContract}
            isConnecting={isConnecting}
          />
        )}

        {/* Main content when connected */}
        {contract && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-12">
              {/* Add Book form */}
              <AddBookForm
                bookDataAdd={bookDataAdd}
                setBookDataAdd={setBookDataAdd}
                handleAddBook={handleAddBook}
                isAddingBook={isAddingBook}
              />
            </div>

            {/* Book listing */}
            <BooksList
              books={books}
              isLoadingBooks={isLoadingBooks}
              refreshBooks={refreshBooks}
              lastUpdated={lastUpdated}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              sortedBooks={sortedBooks}
              setBookIdPurchase={setBookIdPurchase}
              setSelectedBook={setSelectedBook}
              setIsPurchaseModalOpen={setIsPurchaseModalOpen}
              walletAddress={walletAddress}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Purchase Modal */}
      <PurchaseModal />
    </main>
  );
}
