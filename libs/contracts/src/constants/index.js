import * as NFTAddressGoerli from '../contractsData/goerli/NFT-address.json';
import * as NFTAbiGoerli from '../contractsData/goerli/NFT.json';
import * as MarketplaceAddressGoerli from '../contractsData/goerli/Marketplace-address.json';
import * as MarketplaceAbiGoerli from '../contractsData/goerli/Marketplace.json';
import * as NFTAddress from '../contractsData/localhost/NFT-address.json';
import * as NFTAbi from '../contractsData/localhost/NFT.json';
import * as MarketplaceAddress from '../contractsData/localhost/Marketplace-address.json';
import * as MarketplaceAbi from '../contractsData/localhost/Marketplace.json';
import * as NFTAddressSepolia from '../contractsData/sepolia/NFT-address.json';
import * as NFTAbiSepolia from '../contractsData/sepolia/NFT.json';
import * as MarketplaceAddressSepolia from '../contractsData/sepolia/Marketplace-address.json';
import * as MarketplaceAbiSepolia from '../contractsData/sepolia/Marketplace.json';

export const NETWORK_NAMES = {
  SEPOLIA: 'Sepolia',
  GOERLI: 'Goerli',
  POLYGON: 'Polygon',
  LOCALHOST: 'Localhost'
};

export const NETWORK_IDS = {
  SEPOLIA: '0xaa36a7',
  GOERLI: '0x5',
  POLYGON: '0x89',
  LOCALHOST: '0x7a69'
};

export const CONTRACTS = {
  [NETWORK_IDS.GOERLI]: {
    // Goerli
    NFT: {
      address: NFTAddressGoerli.address,
      abi: NFTAbiGoerli.abi
    },
    MARKETPLACE: {
      address: MarketplaceAddressGoerli.address,
      abi: MarketplaceAbiGoerli.abi
    }
  },
  [NETWORK_IDS.LOCALHOST]: {
    // Localhost
    NFT: {
      address: NFTAddress.address,
      abi: NFTAbi.abi
    },
    MARKETPLACE: {
      address: MarketplaceAddress.address,
      abi: MarketplaceAbi.abi
    }
  },
  [NETWORK_IDS.SEPOLIA]: {
    // Sepolia Testnet
    NFT: {
      address: NFTAddressSepolia.address,
      abi: NFTAbiSepolia.abi
    },
    MARKETPLACE: {
      address: MarketplaceAddressSepolia.address,
      abi: MarketplaceAbiSepolia.abi
    }
  }
};
