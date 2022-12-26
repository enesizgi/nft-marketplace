import { ethers } from 'ethers';
import { CONTRACTS, JSON_RPC_PROVIDER } from '../constants';

export const getMarketplaceContractFn = (userID, chainID, defaultChainID) => {
  let marketplaceContract;
  if (chainID && CONTRACTS[chainID]) marketplaceContract = CONTRACTS[chainID].MARKETPLACE;
  else if (window.location.href.includes('localhost')) marketplaceContract = CONTRACTS['0x7a69'].MARKETPLACE;
  else marketplaceContract = CONTRACTS[defaultChainID].MARKETPLACE;
  if (userID && chainID) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    return new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, signer1);
  }
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
  return new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, provider);
};

export const getNFTContractFn = (userID, chainID, defaultChainID) => {
  let nftContract;
  if (chainID && CONTRACTS[chainID]) nftContract = CONTRACTS[chainID].NFT;
  else if (window.location.href.includes('localhost')) nftContract = CONTRACTS['0x7a69'].NFT;
  else nftContract = CONTRACTS[defaultChainID].NFT;
  if (userID && chainID) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    return new ethers.Contract(nftContract.address, nftContract.abi, signer1);
  }
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
  return new ethers.Contract(nftContract.address, nftContract.abi, provider);
};
