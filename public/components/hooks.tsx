import { useEffect, useState } from "react";
import Book from "./IBook";
import { ethers } from "ethers";

export function useAllBooks(contract: any) {
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
            owner: book[5],
            authorWallet: book[6],
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
            owner: book[5],
            authorWallet: book[6],
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
}

//--------------------------------------------------------------------------------------------

export function usePurchase(contract: any) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  async function purchaseBook(bookId: any) {
    try {
      setIsPurchasing(true);
      //@ts-ignore
      await window.ethereum.enable();

      // Get user's address
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Check if user already owns this book
      try {
        // Check purchased books from user history
        const userBooks = await contract.getUserBooks();
        const userBookIds = userBooks[0].map((id: any) => Number(id));
        
        if (userBookIds.includes(Number(bookId))) {
          setIsPurchasing(false);
          return { 
            success: false, 
            message: "You already own this book." 
          };
        }
      } catch (error) {
        console.error("Error checking book ownership:", error);
      }

      // Always purchase with quantity 1
      const quantity = 1;
      
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
}

export function useAddBook(contract: any) {
  const [isLoading, setIsLoading] = useState(false);

  const addBook = async (
    title: string,
    author: string,
    price: string,
    stock: string,
    authorWallet: string
  ) => {
    try {
      const priceAsNumber = parseFloat(price);
      const stockAsNumber = parseInt(stock);

      // Validate inputs
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

      // Validate author wallet address
      if (!authorWallet || !ethers.utils.isAddress(authorWallet)) {
        return {
          success: false,
          message: "Please enter a valid author wallet address.",
        };
      }

      setIsLoading(true);

      // Convert the wallet address to a payable address format
      const payableAuthorWallet = authorWallet; // ethers.js will handle this appropriately

      // Call the updated contract function with author wallet parameter
      const tx = await contract.addBook(
        title,
        author,
        ethers.utils.parseEther(price),
        stock,
        payableAuthorWallet
      );

      // Wait for transaction confirmation
      await tx.wait();

      setIsLoading(false);
      return { success: true, message: "Book added successfully!" };
    } catch (error: unknown) {
      console.error("Error adding book:", error);
      setIsLoading(false);

      // Provide more specific error messages based on error type
      let errorMessage = "Error adding book.";
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        const errorMsg = (error as { message: string }).message;
        if (errorMsg.includes("user rejected")) {
          errorMessage = "Transaction was rejected by the user.";
        } else if (errorMsg.includes("invalid address")) {
          errorMessage = "Invalid author wallet address format.";
        }
      }

      return { success: false, message: errorMessage };
    }
  };

  return { addBook, isLoading };
}

//---------------------------------------------------------------------------------------------

// Get book hook
export function useGetBook(contract: any) {
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
}
