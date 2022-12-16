/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  slug: '',
  name: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserID: (state, action) => {
      state.id = action.payload;
    },
    setUsername: (state, action) => {
      state.name = action.payload;
    },
    setSlug: (state, action) => {
      state.slug = action.payload;
    },
    setUser: (state, action) => {
      const { id, name, slug } = action.payload;
      state.id = id;
      state.name = name;
      state.slug = slug;
    }
  }
});

export default userSlice.reducer;
export const { setUserID, setUsername, setSlug, setUser } = userSlice.actions;
