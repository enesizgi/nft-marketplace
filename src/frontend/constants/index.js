import MarketplaceAddress from '../contractsData/localhost/Marketplace-address.json';
import MarketplaceAbi from '../contractsData/localhost/Marketplace.json';
import NFTAddress from '../contractsData/localhost/NFT-address.json';
import NFTAbi from '../contractsData/localhost/NFT.json';
import MarketplaceAddressGoerli from '../contractsData/goerli/Marketplace-address.json';
import MarketplaceAbiGoerli from '../contractsData/goerli/Marketplace.json';
import NFTAddressGoerli from '../contractsData/goerli/NFT-address.json';
import NFTAbiGoerli from '../contractsData/goerli/NFT.json';
import EthereumLogo from '../assets/ethereum-logo.png';
import { ReactComponent as PolygonLogo } from '../assets/polygon-logo.svg';

export const theme = {
  blue: 'rgb(64,75,133)',
  buttonBackground: '#151827'
};

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

// export const JSON_RPC_PROVIDER = window.location.href.includes('localhost') ? 'http://localhost:8545' : '';
export const JSON_RPC_PROVIDER = window.location.href.includes('localhost') ? 'http://localhost:8545' : 'https://ethereum-goerli-rpc.allthatnode.com';

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

export const CHAIN_PARAMS = {
  '0x5': {
    chainId: '0x5',
    rpcUrls: ['https://goerli.infura.io/v3/'],
    chainName: 'Goerli',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH', // 2-6 characters long
      decimals: 18
    },
    blockExplorerUrls: ['https://goerli.etherscan.io']
  },
  '0x89': {
    chainId: '0x89',
    rpcUrls: ['https://polygon-rpc.com/'],
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC', // 2-6 characters long
      decimals: 18
    },
    blockExplorerUrls: ['https://polygonscan.com/']
  }
};

export const NETWORK_LOGOS = {
  '0x5': {
    type: 'png',
    src: EthereumLogo
  },
  '0x89': {
    type: 'svg',
    src: PolygonLogo
  }
};
