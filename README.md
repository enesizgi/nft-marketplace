# NFT Marketplace

## Technology Stack & Tools

- Solidity (Writing Smart Contract)
- Javascript (React & Testing)
- [Ethers](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ipfs](https://ipfs.io/) (Metadata storage)
- [React routers](https://v5.reactrouter.com/) (Navigational components)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/), should work with any node version below 16.5.0
- Install [Hardhat](https://hardhat.org/)

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:
```
$ pnpm install
```

### 3. Start the local blockchain:
```
$ npx hardhat node
```

### 4. Deploy the smart contract:
```
$ npx hardhat run src/backend/scripts/deploy.js --network localhost
```

### Command to use hardhat console:
```
$ npx hardhat console --network localhost
```

Note: You should be in the root directory of the project to run the above commands.

License
----
MIT
