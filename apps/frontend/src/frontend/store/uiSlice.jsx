/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { DEVICE_TYPES } from '../constants';

const initialState = {
  deviceType: DEVICE_TYPES.DESKTOP,
  leftPanelOpened: false,
  currentPath: '/',
  loading: { isLoading: false, message: '' },
  activeModal: { type: '', props: {} },
  toast: ''
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
    setLoading: (state, action) => {
      if (typeof action.payload === 'object') {
        state.loading = action.payload;
      } else {
        state.loading = { isLoading: action.payload, message: '' };
      }
    },
    setActiveModal: (state, action) => {
      if (typeof action.payload === 'object') {
        state.activeModal = action.payload;
      } else {
        state.activeModal = { type: '', props: {} };
      }
    },
    setToast: (state, action) => {
      const isReset = !action.payload;
      state.toast = isReset ? action.payload : { ...action.payload, id: Math.random() };
    },
    loadNFT: () => {}
  }
});

export default uiSlice.reducer;
export const { setDeviceType, setLeftPanelOpened, setCurrentPath, setLoading, setActiveModal, loadNFT, setToast } = uiSlice.actions;
