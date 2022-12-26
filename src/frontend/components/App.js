import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setDeviceType } from '../store/uiSlice';
import { getDeviceType } from '../store/selectors';
import { DEVICE_TYPES } from '../constants';
import HomePage from './Home';
import MintNFTSPage from './MintNFTS';
import ListNFTSPage from './ListNFTS';
import PurchasesPage from './Purchases';
import NavigationBar from './NavigationBar';
import Profile from './Profile';
import GlobalStyle from './GlobalStyle';
import LeftPanel from './LeftPanel';
import NFTDetailPage from './NFTDetailPage';
import RouteListener from './RouteListener';

const App = () => {
  const dispatch = useDispatch();

  const deviceType = useSelector(getDeviceType);

  const updateDeviceType = () => {
    if (window.innerWidth <= 480) {
      dispatch(setDeviceType(DEVICE_TYPES.MOBILE));
    } else if (window.innerWidth <= 768) {
      dispatch(setDeviceType(DEVICE_TYPES.TABLET));
    } else {
      dispatch(setDeviceType(DEVICE_TYPES.DESKTOP));
    }
  };

  useEffect(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
  }, []);

  return (
    <BrowserRouter>
      <RouteListener />
      <GlobalStyle />
      <div className="App">
        {deviceType !== DEVICE_TYPES.DESKTOP && <LeftPanel />}
        <NavigationBar />
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/user/*" element={<Profile />} />
          <Route path="/mint-nfts" element={<MintNFTSPage />} />
          <Route path="/my-listed-nfts" element={<ListNFTSPage />} />
          <Route path="/my-purchases" element={<PurchasesPage />} />
          <Route path="/nft/*" element={<NFTDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
