import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import marketplaceSlice from './marketplaceSlice';
import profileSlice from './profileSlice';
import listenerMiddleware from './listenerMiddleware';

const store = configureStore({
  reducer: {
    user: userSlice,
    marketplace: marketplaceSlice,
    profile: profileSlice
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});

export default store;
