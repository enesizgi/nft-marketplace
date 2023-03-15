import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    setNFT: (state, action) => action.payload
  }
});

export default nftSlice.reducer;
export const { setNFT } = nftSlice.actions;
