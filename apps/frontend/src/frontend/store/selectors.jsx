import { ethers } from 'ethers';
import { createSelector } from 'reselect';
import { getMarketplaceContractFn, getNFTContractFn, getProviderOrSignerFn, getwETHContractFn } from '../components/utils';
import { defaultChainId, DEVICE_TYPES } from '../constants';

export const getUser = state => state.user;

export const getMarketplace = state => state.marketplace;

export const getProfile = state => state.profile;

export const getUI = state => state.ui;

export const getNFT = state => state.nft;

export const getListedItems = state => state.listing;

export const getUserId = createSelector(getUser, ({ id }) => id.toLowerCase());

export const getUserSlug = createSelector(getUser, ({ slug }) => slug);

export const getUsername = createSelector(getUser, ({ name }) => name);

export const getChainId = createSelector(getMarketplace, ({ chainId }) => chainId);

export const getChainIdWithDefault = createSelector(getChainId, chainId => chainId || defaultChainId);

export const getMarketplaceContract = createSelector(getUserId, getChainId, getMarketplaceContractFn);

export const getNFTContract = createSelector(getUserId, getChainId, getNFTContractFn);

export const getwETHContract = createSelector(getUserId, getChainId, getwETHContractFn);

export const getProviderOrSigner = createSelector(getUserId, getChainId, getProviderOrSignerFn);

export const getIsLoadingContracts = createSelector(getMarketplace, ({ isLoadingContracts }) => isLoadingContracts);

export const getETHPriceUSD = createSelector(getMarketplace, ({ ethPriceUSD }) => ethPriceUSD);

export const getUserProfilePhoto = createSelector(getUser, ({ profilePhoto }) => profilePhoto);

export const getUserCoverPhoto = createSelector(getUser, ({ coverPhoto }) => coverPhoto);

export const getUserFavorites = createSelector(getUser, ({ favorites }) => favorites ?? []);

export const getCart = createSelector(getUser, ({ cart }) => cart ?? []);

export const getIsInCart = id => createSelector(getCart, cart => !!cart.find(_id => _id === id));

export const getIsInFavorites = id => createSelector(getUserFavorites, favorites => !!favorites.find(_id => _id === id));

export const getSignedMessage = createSelector(getUser, ({ signedMessage }) => signedMessage);

export const getProfileId = createSelector(getProfile, ({ id }) => id);

export const getProfileName = createSelector(getProfile, ({ name }) => name);

export const getProfileSlug = createSelector(getProfile, ({ slug }) => slug);

export const getProfilePhoto = createSelector(getProfile, ({ profilePhoto }) => profilePhoto);

export const getCoverPhoto = createSelector(getProfile, ({ coverPhoto }) => coverPhoto);

export const getIsProfileOwner = createSelector([getUserId, getProfileId], (userId, profileId) => userId === profileId);

export const getDeviceType = createSelector(getUI, ({ deviceType }) => deviceType);

export const getButtonSize = createSelector(getDeviceType, deviceType => {
  switch (deviceType) {
    case DEVICE_TYPES.MOBILE:
      return 'sm';
    case DEVICE_TYPES.TABLET:
      return 'md';
    default:
      return 'lg';
  }
});

export const getIsLeftPanelOpened = createSelector(getUI, ({ leftPanelOpened }) => leftPanelOpened);

export const getLoadingInfo = createSelector(getUI, ({ loading }) => loading);

export const getToastInfo = createSelector(getUI, ({ toast }) => toast);

export const getIsLoading = createSelector(getLoadingInfo, ({ isLoading }) => isLoading);

export const getLoadingMessage = createSelector(getLoadingInfo, ({ message }) => message);

export const getCurrentPath = createSelector(getUI, ({ currentPath }) => currentPath);

export const getActiveModal = createSelector(getUI, ({ activeModal }) => activeModal);

export const getNFTMetadata = createSelector(getNFT, ({ metadata }) => metadata);

export const getNFTCid = createSelector(getNFTMetadata, ({ cid }) => cid);

export const getIsListed = createSelector(getNFT, ({ isListed }) => isListed);

export const getIsOnAuction = createSelector(getNFT, ({ isOnAuction }) => isOnAuction);

export const getNFTName = createSelector(getNFTMetadata, ({ name }) => name);

export const getNFTOwner = createSelector(getNFT, ({ owner }) => owner);

export const getNFTSeller = createSelector(getNFT, ({ seller }) => seller);

export const getWinner = createSelector(getNFT, ({ winner }) => winner);

export const getNFTURL = createSelector(getNFTMetadata, ({ url }) => url);

export const getNFTDescription = createSelector(getNFTMetadata, ({ description }) => description);

export const getNFTTransactions = createSelector(getNFT, ({ transactions }) => transactions);

export const getNFTBids = createSelector(getNFT, ({ bids }) => bids);

export const getNFTOffers = createSelector(getNFT, ({ offers }) => offers);

export const getTokenId = createSelector(getNFT, ({ tokenId }) => tokenId);

export const getPriceOfNFT = createSelector(getNFT, ({ price }) => price);

export const getTotalPriceOfNFT = createSelector(getNFT, ({ totalPrice }) => totalPrice);

export const getFormattedPrice = createSelector(getNFT, ({ totalPrice }) => (totalPrice ? ethers.utils.formatEther(totalPrice.toString()) : ''));

export const getItemId = createSelector(getNFT, ({ itemId }) => itemId);

export const getAuctionId = createSelector(getNFT, ({ auctionId }) => auctionId);

export const getTimeToEnd = createSelector(getNFT, ({ timeToEnd }) => timeToEnd);
