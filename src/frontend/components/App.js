import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Home';
import MintNFTSPage from './MintNFTS';
import ListNFTSPage from './ListNFTS';
import PurchasesPage from './Purchases';
import NavigationBar from './NavigationBar';
import Profile from './Profile';
import GlobalStyle from './GlobalStyle';
import { DEVICE_TYPES } from '../constants';
import LeftPanel from './LeftPanel';
import NFTDetailPage from './NFTDetailPage';

const App = () => {
  const [deviceType, setDeviceType] = useState('');
  const [isLeftPanelOpened, setLeftPanelOpened] = useState(false);

  const toggleLeftPanel = () => setLeftPanelOpened(!isLeftPanelOpened);

  const leftPanelRef = useRef();

  const handleCloseLeftPanel = e => {
    if (leftPanelRef.current && isLeftPanelOpened && !leftPanelRef.current.contains(e.target)) {
      setLeftPanelOpened(false);
    }
  };

  document.addEventListener('mousedown', handleCloseLeftPanel);

  const updateDeviceType = () => {
    if (window.innerWidth <= 480) {
      setDeviceType(DEVICE_TYPES.MOBILE);
    } else if (window.innerWidth <= 768) {
      setDeviceType(DEVICE_TYPES.TABLET);
    } else {
      setDeviceType(DEVICE_TYPES.DESKTOP);
    }
  };

  useEffect(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
  }, []);

  return (
    <BrowserRouter>
      <GlobalStyle />
      <div className="App">
        {deviceType !== DEVICE_TYPES.DESKTOP && (
          <LeftPanel nodeRef={leftPanelRef} isLeftPanelOpened={isLeftPanelOpened} toggleLeftPanel={toggleLeftPanel} />
        )}
        <NavigationBar deviceType={deviceType} toggleLeftPanel={toggleLeftPanel} />
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
