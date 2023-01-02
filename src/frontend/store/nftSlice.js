/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setNFT: (state, action) => 
      // eslint-disable-next-line no-return-assign
       action.payload
    
  }
});

export default nftSlice.reducer;
export const { setNFT } = nftSlice.actions;
