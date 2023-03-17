/* eslint-disable */
import { readFile } from 'node:fs/promises';
import {
  NFTAddressGoerli,
  NFTAbiGoerli,
  MarketplaceAddressGoerli,
  MarketplaceAbiGoerli,
  NFTAddress,
  NFTAbi,
  MarketplaceAddress,
  MarketplaceAbi,
  NFTAddressSepolia,
  NFTAbiSepolia,
  MarketplaceAddressSepolia,
  MarketplaceAbiSepolia
} from 'contracts';

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
  },
  '0xaa36a7': {
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
