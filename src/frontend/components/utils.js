import { ethers } from 'ethers';
import { CONTRACTS, JSON_RPC_PROVIDER } from '../constants';

export const getMarketplaceContractFn = (userId, chainId, defaultChainId) => {
  let marketplaceContract;
  if (chainId && CONTRACTS[chainId]) marketplaceContract = CONTRACTS[chainId].MARKETPLACE;
  else if (window.location.href.includes('localhost')) marketplaceContract = CONTRACTS['0x7a69'].MARKETPLACE;
  else marketplaceContract = CONTRACTS[defaultChainId].MARKETPLACE;
  if (userId && chainId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    return new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, signer1);
  }
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
  return new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, provider);
};

export const getNFTContractFn = (userId, chainId, defaultChainId) => {
  let nftContract;
  if (chainId && CONTRACTS[chainId]) nftContract = CONTRACTS[chainId].NFT;
  else if (window.location.href.includes('localhost')) nftContract = CONTRACTS['0x7a69'].NFT;
  else nftContract = CONTRACTS[defaultChainId].NFT;
  if (userId && chainId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    return new ethers.Contract(nftContract.address, nftContract.abi, signer1);
  }
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
  return new ethers.Contract(nftContract.address, nftContract.abi, provider);
};
