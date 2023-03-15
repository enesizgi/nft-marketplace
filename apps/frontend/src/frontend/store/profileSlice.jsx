/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  slug: '',
  name: '',
  coverPhoto: '',
  profilePhoto: ''
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      const { id, name, slug, coverPhoto, profilePhoto } = action.payload;
      state.id = id;
      state.name = name;
      state.slug = slug;
      state.coverPhoto = coverPhoto;
      state.profilePhoto = profilePhoto;
    }
  }
});

export default profileSlice.reducer;
export const { setProfile } = profileSlice.actions;
