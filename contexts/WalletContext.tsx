"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/BookStore.sol/BookStore.json";
import contractConfig from "../contract-config.json";

interface WalletContextType {
  contract: any;
  walletAddress: string;
  isConnecting: boolean;
  isContractOwner: boolean;
  connectWallet: () => Promise<{ success: boolean; message: string; }>;
  showNotification?: (type: string, message: string) => void;
}

const WalletContext = createContext<WalletContextType>({
  contract: null,
  walletAddress: "",
  isConnecting: false,
  isContractOwner: false,
  connectWallet: async () => ({ success: false, message: "Wallet not connected" }),
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contract, setContract] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isContractOwner, setIsContractOwner] = useState(false);
  const contractAddress = contractConfig.contractAddress || "";
  const contractABI = atm_abi.abi;

  // Check if the wallet is already connected in localStorage
  useEffect(() => {
    const checkConnection = async () => {
      const savedAddress = localStorage.getItem("walletAddress");
      
      if (savedAddress && window.ethereum) {
        try {
          setIsConnecting(true);
          
          // Get current accounts to verify the connection is still valid
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            // User is still connected
            const address = accounts[0];
            setWalletAddress(address);
            
            // Reconnect contract
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            const contract = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );
            
            // Check if user is contract owner
            try {
              const owner = await contract.owner();
              setIsContractOwner(owner.toLowerCase() === address.toLowerCase());
            } catch (error) {
              console.error("Error checking contract owner:", error);
            }
            
            setContract(contract);
          }
        } catch (error) {
          console.error("Error reconnecting wallet:", error);
          localStorage.removeItem("walletAddress");
        } finally {
          setIsConnecting(false);
        }
      }
    };
    
    checkConnection();
  }, [contractABI, contractAddress]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User has disconnected
          setWalletAddress("");
          setContract(null);
          localStorage.removeItem("walletAddress");
        } else {
          // Account changed
          const newAddress = accounts[0];
          setWalletAddress(newAddress);
          localStorage.setItem("walletAddress", newAddress);
          
          // Reconnect with new account
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          
          // Check if new user is contract owner
          try {
            const owner = await contract.owner();
            setIsContractOwner(owner.toLowerCase() === newAddress.toLowerCase());
          } catch (error) {
            console.error("Error checking contract owner:", error);
          }
          
          setContract(contract);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [contractABI, contractAddress]);

  const connectWallet = async () => {
    try {
      if (!contractAddress) {
        throw new Error("Contract address is not defined");
      }

      setIsConnecting(true);
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      try {
        const owner = await contract.owner();
        setIsContractOwner(owner.toLowerCase() === address.toLowerCase());
      } catch (error) {
        console.error("Error checking contract owner:", error);
      }

      setContract(contract);
      return { success: true, message: "Connected to BookStore contract!" };
    } catch (error) {
      console.error("Error connecting to the contract:", error);
      return { 
        success: false, 
        message: "Failed to connect. Make sure MetaMask is installed and unlocked." 
      };
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        contract,
        walletAddress,
        isConnecting,
        isContractOwner,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};