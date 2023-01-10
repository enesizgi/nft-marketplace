/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chainId: null,
  defaultChainId: '0x5',
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
    setChainId: (state, action) => {
      state.chainId = action.payload;
    },
    setIsLoadingContracts: (state, action) => {
      state.isLoadingContracts = action.payload;
    }
  }
});

export default marketplaceSlice.reducer;
export const { setMarketplace, setChainId, setIsLoadingContracts } = marketplaceSlice.actions;
