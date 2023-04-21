/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  slug: '',
  name: '',
  coverPhoto: '',
  profilePhoto: '',
  favorites: [],
  cart: [],
  signedMessage: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.id = action.payload;
    },
    setUsername: (state, action) => {
      state.name = action.payload;
    },
    setUserSlug: (state, action) => {
      state.slug = action.payload;
    },
    setUserCoverPhoto: (state, action) => {
      state.coverPhoto = action.payload;
    },
    setUserProfilePhoto: (state, action) => {
      state.profilePhoto = action.payload;
    },
    setUserFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    setCart: (state, action) => {
      state.cart = action.payload;
    },
    setUser: (state, action) => ({ ...initialState, ...action.payload }),
    setSignedMessage: (state, action) => {
      state.signedMessage = action.payload;
    },
    resetUser: () => initialState
  }
});

export default userSlice.reducer;
export const {
  setUserId,
  setUsername,
  setUserSlug,
  setUserCoverPhoto,
  setUserProfilePhoto,
  setUserFavorites,
  setCart,
  setUser,
  setSignedMessage,
  resetUser
} = userSlice.actions;
