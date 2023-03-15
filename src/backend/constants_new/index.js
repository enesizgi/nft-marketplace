/* eslint-disable */
import { readFile } from 'node:fs/promises';
const importJSON = async path => {
  const fileUrl = new URL(path, import.meta.url);
  return JSON.parse(await readFile(fileUrl, 'utf8'));
};

const [NFTAddressGoerli, NFTAbiGoerli, MarketplaceAddressGoerli, MarketplaceAbiGoerli, NFTAddress, NFTAbi, MarketplaceAddress, MarketplaceAbi] =
  await Promise.all([
    importJSON('../contractsData/goerli/NFT-address.json'),
    importJSON('../contractsData/goerli/NFT.json'),
    importJSON('../contractsData/goerli/Marketplace-address.json'),
    importJSON('../contractsData/goerli/Marketplace.json'),
    importJSON('../contractsData/localhost/NFT-address.json'),
    importJSON('../contractsData/localhost/NFT.json'),
    importJSON('../contractsData/localhost/Marketplace-address.json'),
    importJSON('../contractsData/localhost/Marketplace.json')
  ]);
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
