# Prerequisites
- Node.js (v14.0+)
- npm
- Git

# Setup
### 1. Clone the repository
```bash
git clone https://github.com/yourusername/Book-House.git
```
### 2. Navigate to the project directory
```bash
cd Book-House
```
### 3. Install dependencies
```bash
npm install
```
### 4. Configure environment variables
 - Create a .env file in the root folder.
 - Get the project ID and Sepolia RPC URL from www.infura.io. 
 - Get your private key from the account details, in your Meta Mask wallet.
 - embed these values in the created .env file
```bash
INFURA_PROJECT_ID = "{YOUR INFURA PROJECT ID}" 
PRIVATE_KEY = "{YOUR META MASK PRIVATE KEY}"
SEPOLIA_RPC_URL = "{YOUR SEPOLIA RPC URL}"
```
### 5. Compile and deploy the smart contracts
```bash
npx hardhat run scripts/deploy.ts --network Sepolia
```
### 6. Run the application
```bash
npm run dev
```
