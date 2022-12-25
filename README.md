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

### 3. Start all of the services:

```
$ pnpm start:all
$ pnpm hardhat:deploy
```

Wait some time after running _pnpm start:all_ command, it will start the hardhat development blockchain. Then, you can run _pnpm hardhat:deploy_ command below.

Note: You should be in the root directory of the project to run the above commands.

Note: You can skip below commands if you used the above commands at the 3rd step.

### Start the local blockchain:

```
$ pnpm hardhat
```

### Deploy the smart contract:

```
$ pnpm hardhat:deploy
```

### Command to use hardhat console:

```
$ npx hardhat console --network localhost
```

## Commit convention:

**type(subproject): commit message**

- **type**: One of _fix_, _refactor_, _chore_, _feat_, _ui_. _fix_, _refactor_, and _ui_ are trivial. _chore_ can be used when a new library is added, or some config is implemented. _feat_ can be used for new component, class, method implementations.
- **subproject**: You can accept _frontend_ and _backend_ as subprojects. When your changes are hard to separate from frontend or backend, you can use **type: commit message** convention.

More information about conventional commits: https://www.conventionalcommits.org/en/v1.0.0/#summary

## License

MIT
