import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import marketplaceSlice from './marketplaceSlice';
import profileSlice from './profileSlice';
import uiSlice from './uiSlice';
import nftSlice from './nftSlice';
import listenerMiddleware from './listenerMiddleware';
import listingSlice from './listingSlice';

const store = configureStore({
  reducer: {
    user: userSlice,
    marketplace: marketplaceSlice,
    profile: profileSlice,
    ui: uiSlice,
    nft: nftSlice,
    listing: listingSlice
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});

export default store;
