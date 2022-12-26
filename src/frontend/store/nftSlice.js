/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setNFT: (state, action) => {
      const { tokenID } = action.payload;
      state[tokenID] = action.payload;
    }
  }
});

export default nftSlice.reducer;
export const { setNFT } = nftSlice.actions;
