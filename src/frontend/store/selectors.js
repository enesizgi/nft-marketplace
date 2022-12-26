import { createSelector } from 'reselect';
import { getMarketplaceContractFn, getNFTContractFn } from '../components/utils';

export const getUser = state => state.user;

export const getMarketplace = state => state.marketplace;

export const getProfile = state => state.profile;

export const getUI = state => state.ui;

export const getUserID = createSelector(getUser, ({ id }) => id);

export const getUserSlug = createSelector(getUser, ({ slug }) => slug);

export const getUsername = createSelector(getUser, ({ name }) => name);

export const getChainID = createSelector(getMarketplace, ({ chainID }) => chainID);

export const getDefaultChainID = createSelector(getMarketplace, ({ defaultChainID }) => defaultChainID);

export const getMarketplaceContract = createSelector(getUserID, getChainID, getDefaultChainID, getMarketplaceContractFn);

export const getNFTContract = createSelector(getUserID, getChainID, getDefaultChainID, getNFTContractFn);

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
