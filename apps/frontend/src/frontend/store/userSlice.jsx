/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  slug: '',
  name: '',
  coverPhoto: '',
  profilePhoto: '',
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
    setUser: (state, action) => {
      const { id, name, slug, coverPhoto, profilePhoto } = action.payload;
      state.id = id;
      state.name = name;
      state.slug = slug;
      state.coverPhoto = coverPhoto;
      state.profilePhoto = profilePhoto;
    },
    setSignedMessage: (state, action) => {
      state.signedMessage = action.payload;
    },
    resetUser: () => initialState
  }
});

export default userSlice.reducer;
export const { setUserId, setUsername, setUserSlug, setUserCoverPhoto, setUserProfilePhoto, setUser, setSignedMessage, resetUser } =
  userSlice.actions;
