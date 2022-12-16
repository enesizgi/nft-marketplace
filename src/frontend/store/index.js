import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import marketplaceSlice from './marketplaceSlice';
import listenerMiddleware from './listenerMiddleware';

const store = configureStore({
  reducer: {
    user: userSlice,
    marketplace: marketplaceSlice
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware)
});

export default store;
