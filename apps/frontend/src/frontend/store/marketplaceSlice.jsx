/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { defaultChainId } from '../constants';

const initialState = {
  chainId: defaultChainId,
  ethPriceUSD: 1
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
    setETHPriceUSD: (state, action) => {
      state.ethPriceUSD = action.payload;
    }
  }
});

export default marketplaceSlice.reducer;
export const { setMarketplace, setChainId, setETHPriceUSD } = marketplaceSlice.actions;
