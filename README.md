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
The smart contract has already been deployed on an Ethereum Sepolia network. If you want to deploy on your own network, create a .env file in the root folder and add these variables.
You can get the project ID and Sepolia RPC URL from www.infura.io. Your private key is to be taken from the account details, in Meta Mask wallet. 
```bash
INFURA_PROJECT_ID = "" 
PRIVATE_KEY = ""
SEPOLIA_RPC_URL = ""
```
### 5. Compile and deploy the smart contracts
```bash
npx hardhat run scripts/deploy.ts
```
### 6. Run the application
```bash
npm run dev
```
