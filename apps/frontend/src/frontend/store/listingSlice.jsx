import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    setListedItems: (state, action) => action.payload
  }
});

export default listingSlice.reducer;
export const { setListedItems } = listingSlice.actions;
