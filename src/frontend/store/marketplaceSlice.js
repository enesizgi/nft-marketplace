/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chainID: null,
  isLoadingContracts: true
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setMarketplace: (state, action) => {
      const keys = Object.keys(action.payload);
      // eslint-disable-next-line no-return-assign
      keys.forEach(key => (state[key] = action.payload[key]));
    },
    setChainID: (state, action) => {
      state.chainID = action.payload;
    },
    setIsLoadingContracts: (state, action) => {
      state.isLoadingContracts = action.payload;
    }
  }
});

export default marketplaceSlice.reducer;
export const { setMarketplace, setChainID, setIsLoadingContracts } = marketplaceSlice.actions;
