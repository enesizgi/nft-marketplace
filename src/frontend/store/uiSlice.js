/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { DEVICE_TYPES } from '../constants';

const initialState = {
  deviceType: DEVICE_TYPES.DESKTOP,
  leftPanelOpened: false,
  currentPath: '/',
  loading: true
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDeviceType: (state, action) => {
      state.deviceType = action.payload;
    },
    setLeftPanelOpened: (state, action) => {
      state.leftPanelOpened = action.payload;
    },
    setCurrentPath: (state, action) => {
      state.currentPath = action.payload;
    },
    setIsLoading: (state, action) => {
      state.loading = action.payload;
    },
    loadNFT: () => {}
  }
});

export default uiSlice.reducer;
export const { setDeviceType, setLeftPanelOpened, setCurrentPath, setIsLoading, loadNFT } = uiSlice.actions;
