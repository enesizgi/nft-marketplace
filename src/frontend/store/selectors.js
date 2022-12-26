import { createSelector } from 'reselect';
import { ethers } from 'ethers';
import { JSON_RPC_PROVIDER, CONTRACTS } from '../constants';

export const getUser = state => state.user;

export const getMarketplace = state => state.marketplace;

export const getProfile = state => state.profile;

export const getUI = state => state.ui;

export const getUserID = createSelector(getUser, ({ id }) => id);

export const getUserSlug = createSelector(getUser, ({ slug }) => slug);

export const getUsername = createSelector(getUser, ({ name }) => name);

export const getChainID = createSelector(getMarketplace, ({ chainID }) => chainID);

export const getDefaultChainID = createSelector(getMarketplace, ({ defaultChainID }) => defaultChainID);

export const getMarketplaceContract = createSelector(getUserID, getChainID, getDefaultChainID, (userID, chainID, defaultChainID) => {
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
});

export const getNFTContract = createSelector(getUserID, getChainID, getDefaultChainID, (userID, chainID, defaultChainID) => {
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
});

export const getIsLoadingContracts = createSelector(getMarketplace, ({ isLoadingContracts }) => isLoadingContracts);

export const getUserProfilePhoto = createSelector(getUser, ({ profilePhoto }) => profilePhoto);

export const getUserCoverPhoto = createSelector(getUser, ({ coverPhoto }) => coverPhoto);

export const getProfileID = createSelector(getProfile, ({ id }) => id);

export const getProfileName = createSelector(getProfile, ({ name }) => name);

export const getProfileSlug = createSelector(getProfile, ({ slug }) => slug);

export const getProfilePhoto = createSelector(getProfile, ({ profilePhoto }) => profilePhoto);

export const getCoverPhoto = createSelector(getProfile, ({ coverPhoto }) => coverPhoto);

export const getIsProfileOwner = createSelector([getUserID, getProfileID], (userID, profileID) => userID === profileID);

export const getDeviceType = createSelector(getUI, ({ deviceType }) => deviceType);

export const getIsLeftPanelOpened = createSelector(getUI, ({ leftPanelOpened }) => leftPanelOpened);

export const getCurrentPath = createSelector(getUI, ({ currentPath }) => currentPath);
