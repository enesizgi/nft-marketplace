/* eslint-disable */
import { readFile } from 'node:fs/promises';
const importJSON = async path => {
  const fileUrl = new URL(path, import.meta.url);
  return JSON.parse(await readFile(fileUrl, 'utf8'));
};
const NFTAddressGoerli = importJSON('../contractsData/goerli/NFT-address.json');
const NFTAbiGoerli = importJSON('../contractsData/goerli/NFT.json');
const MarketplaceAddressGoerli = importJSON('../contractsData/goerli/Marketplace-address.json');
const MarketplaceAbiGoerli = importJSON('../contractsData/goerli/Marketplace.json');
const NFTAddress = importJSON('../contractsData/localhost/NFT-address.json');
const NFTAbi = importJSON('../contractsData/localhost/NFT.json');
const MarketplaceAddress = importJSON('../contractsData/localhost/Marketplace-address.json');
const MarketplaceAbi = importJSON('../contractsData/localhost/Marketplace.json');

export const CONTRACTS = {
  '0x5': {
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
  '0x7a69': {
    // Localhost
    NFT: {
      address: NFTAddress.address,
      abi: NFTAbi.abi
    },
    MARKETPLACE: {
      address: MarketplaceAddress.address,
      abi: MarketplaceAbi.abi
    }
  }
};
