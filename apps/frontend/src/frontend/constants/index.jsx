import EthereumLogo from '../assets/ethereum-logo.png';
import HardhatLogo from '../assets/hardhat-logo.png';
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
export const JSON_RPC_PROVIDER = window.location.href.includes('localhost') ? 'http://localhost:8545' : 'https://goerli.infura.io/v3/';

export const NFT_ACTIVITY_TYPES = {
  MINT: 'Mint',
  TRANSFER: 'Transfer',
  SALE: 'Sale'
};

export const NFT_LISTING_TYPES = {
  FIXED_PRICE: 'fixed_price',
  AUCTION: 'auction'
};

export const MODAL_TYPES = {
  SELL: 'sell',
  BUY: 'buy',
  IMAGE_PREVIEW: 'image_preview'
};

export const CHAIN_PARAMS = {
  '0xaa36a7': {
    chainId: '0xaa36a7',
    rpcUrls: ['https://rpc2.sepolia.org/'],
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH', // 2-6 characters long
      decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
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
  },
  '0x7a69': {
    chainId: '0x7a69',
    rpcUrls: ['http://localhost:8545'],
    chainName: 'Localhost',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH', // 2-6 characters long
      decimals: 18
    }
  }
};

export const NETWORK_LOGOS = {
  '0xaa36a7': {
    type: 'png',
    src: EthereumLogo
  },
  '0x5': {
    type: 'png',
    src: EthereumLogo
  },
  '0x89': {
    type: 'svg',
    src: PolygonLogo
  },
  '0x7a69': {
    type: 'png',
    src: HardhatLogo
  }
};
