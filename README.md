# Prerequisites
- Node.js (v14.0+)
- npm
- Git

# Setup
## Clone the repository
```bash
git clone https://github.com/yourusername/Book-House.git
```
## Navigate to the project directory
```bash
cd Book-House
```
## Install dependencies
```bash
npm install
```
## Configure environment variables
The smart contract has already been deployed on an Ethereum Sepolia network. If you want to deploy on your own network, create a .env file in the root folder and add these variables.
You can get the project ID and Sepolia RPC URL from www.infura.io. Your private key is to be taken from the account details, in Meta Mask wallet. 

```bash
INFURA_PROJECT_ID = "" 
PRIVATE_KEY = ""
SEPOLIA_RPC_URL = ""
```
## Run the application
```bash
npm run dev
```
