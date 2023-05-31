require('hardhat-ethernal');
require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-etherscan');

const dotenv = require('dotenv');

dotenv.config();

const { ALCHEMY_GOERLI_API_KEY, ALCHEMY_SEPOLIA_API_KEY, DEPLOYER_PRIVATE_KEY, DISABLE_AUTOMINING, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: '0.8.18',
  paths: {
    artifacts: './libs/contracts/src/artifacts',
    sources: './libs/contracts/src/contracts',
    cache: './libs/contracts/src/cache',
    tests: './libs/contracts/src/test'
  },
  networks: {
    ...(ALCHEMY_GOERLI_API_KEY &&
      DEPLOYER_PRIVATE_KEY && {
        goerli: {
          url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_GOERLI_API_KEY}`,
          accounts: [DEPLOYER_PRIVATE_KEY]
        }
      }),
    ...(ALCHEMY_GOERLI_API_KEY &&
      DEPLOYER_PRIVATE_KEY && {
        sepolia: {
          url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_API_KEY}`,
          accounts: [DEPLOYER_PRIVATE_KEY]
        }
      }),
    ...(DISABLE_AUTOMINING === 'true' && {
      hardhat: {
        mining: {
          auto: false,
          interval: [1000, 2000]
        }
      }
    })
  },
  ...(ETHERSCAN_API_KEY && {
    etherscan: {
      apiKey: {
        goerli: ETHERSCAN_API_KEY,
        sepolia: ETHERSCAN_API_KEY
      }
    }
  }),
  ...(process.env.ETHERNAL_EMAIL &&
    process.env.ETHERNAL_PASSWORD && {
      ethernal: {
        email: process.env.ETHERNAL_EMAIL,
        password: process.env.ETHERNAL_PASSWORD,
        uploadAst: true
      }
    })
};
