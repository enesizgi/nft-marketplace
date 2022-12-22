import { createSelector } from 'reselect';
import { ethers } from 'ethers';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import MarketplaceAbi from '../contractsData/Marketplace.json';
import NFTAddress from '../contractsData/NFT-address.json';
import NFTAbi from '../contractsData/NFT.json';
import { JSON_RPC_PROVIDER } from '../constants';

export const getUser = state => state.user;

export const getMarketplace = state => state.marketplace;

export const getProfile = state => state.profile;

export const getUserID = createSelector(getUser, ({ id }) => id);

export const getUserSlug = createSelector(getUser, ({ slug }) => slug);

export const getUsername = createSelector(getUser, ({ name }) => name);

export const getMarketplaceContract = createSelector(getUserID, userID => {
  if (userID) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    return new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer1);
  }
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
  return new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, provider);
});

export const getNFTContract = createSelector(getUserID, userID => {
  if (userID) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer1 = provider.getSigner();
    return new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer1);
  }
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
  return new ethers.Contract(NFTAddress.address, NFTAbi.abi, provider);
});

export const getChainID = createSelector(getMarketplace, ({ chainID }) => chainID);

export const getIsLoadingContracts = createSelector(getMarketplace, ({ isLoadingContracts }) => isLoadingContracts);

export const getUserProfilePhoto = createSelector(getUser, ({ profilePhoto }) => profilePhoto);

export const getUserCoverPhoto = createSelector(getUser, ({ coverPhoto }) => coverPhoto);

export const getProfileID = createSelector(getProfile, ({ id }) => id);

export const getProfileName = createSelector(getProfile, ({ name }) => name);

export const getProfileSlug = createSelector(getProfile, ({ slug }) => slug);

export const getProfilePhoto = createSelector(getProfile, ({ profilePhoto }) => profilePhoto);

export const getCoverPhoto = createSelector(getProfile, ({ coverPhoto }) => coverPhoto);

export const getIsProfileOwner = createSelector([getUserID, getProfileID], (userID, profileID) => userID === profileID);
