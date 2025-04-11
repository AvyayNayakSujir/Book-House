const hre = require("hardhat"); 
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("Deploying BookStore contract...");
    
    const BookStore = await hre.ethers.getContractFactory("BookStore");
    const bookStore = await BookStore.deploy();
    await bookStore.deployed();

    const contractAddress = bookStore.address;
    console.log("✅ BookStore deployed to:", contractAddress);

    // Update contract-address.json file with the contract address
    const contractConfigPath = path.resolve(__dirname, "../contract-config.json");
    
    // Create contract config object
    const contractConfig = {
      contractAddress: contractAddress
    };
    
    // Write the JSON file
    fs.writeFileSync(
      contractConfigPath, 
      JSON.stringify(contractConfig, null, 2)
    );
    
    console.log("✅ Contract address saved to contract-config.json");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error: any) => {
  console.error("❌ Error in main function:", error);
  process.exitCode = 1;
});