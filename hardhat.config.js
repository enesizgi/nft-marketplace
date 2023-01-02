require('@nomicfoundation/hardhat-toolbox'); // eslint-disable-line import/no-extraneous-dependencies
const dotenv = require('dotenv');

dotenv.config();

const { ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY, DISABLE_AUTOMINING } = process.env;

module.exports = {
  solidity: '0.8.4',
  paths: {
    artifacts: './src/backend/artifacts',
    sources: './src/backend/contracts',
    cache: './src/backend/cache',
    tests: './src/backend/test'
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
          interval: [3000, 6000]
        }
      }
    })
  }
};
