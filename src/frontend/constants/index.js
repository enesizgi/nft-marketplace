import MarketplaceAddress from '../contractsData/localhost/Marketplace-address.json';
import MarketplaceAbi from '../contractsData/localhost/Marketplace.json';
import NFTAddress from '../contractsData/localhost/NFT-address.json';
import NFTAbi from '../contractsData/localhost/NFT.json';
import MarketplaceAddressGoerli from '../contractsData/goerli/Marketplace-address.json';
import MarketplaceAbiGoerli from '../contractsData/goerli/Marketplace.json';
import NFTAddressGoerli from '../contractsData/goerli/NFT-address.json';
import NFTAbiGoerli from '../contractsData/goerli/NFT.json';

export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

export const PAGE_LINKS = {
  MINT_NFTS: 'mint-nfts',
  MY_LISTED_NFTS: 'my-listed-nfts',
  PURCHASES: 'my-purchases'
};

export const PAGE_NAMES = {
  [PAGE_LINKS.MINT_NFTS]: 'Mint NFTs',
  [PAGE_LINKS.MY_LISTED_NFTS]: 'My Listed NFTs',
  [PAGE_LINKS.PURCHASES]: 'My purchases'
};

export const JSON_RPC_PROVIDER = 'http://localhost:8545';

export const NFT_ACTIVITY_TYPES = {
  MINT: 'Mint',
  TRANSFER: 'Transfer',
  SALE: 'Sale'
};

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
