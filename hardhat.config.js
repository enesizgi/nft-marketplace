require('hardhat-ethernal');
require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-etherscan');

const dotenv = require('dotenv');

dotenv.config();

const { ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY, DISABLE_AUTOMINING, VITE_ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: '0.8.4',
  paths: {
    artifacts: './libs/contracts/src/artifacts',
    sources: './libs/contracts/src/contracts',
    cache: './libs/contracts/src/cache',
    tests: './libs/contracts/src/test'
  },
  networks: {
    ...(ALCHEMY_API_KEY &&
      GOERLI_PRIVATE_KEY && {
        goerli: {
          url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
          accounts: [GOERLI_PRIVATE_KEY]
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
  ...(VITE_ETHERSCAN_API_KEY && {
    etherscan: {
      apiKey: {
        goerli: VITE_ETHERSCAN_API_KEY
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
