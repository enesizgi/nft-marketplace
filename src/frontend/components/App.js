import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ethers } from 'ethers';
import HomePage from './Home';
import MintNFTSPage from './MintNFTS';
import ListNFTSPage from './ListNFTS';
import PurchasesPage from './Purchases';
import NavigationBar from './NavigationBar';

import MarketplaceAbi from '../contractsData/Marketplace.json';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import NFTAbi from '../contractsData/NFT.json';
import NFTAddress from '../contractsData/NFT-address.json';
import Profile from './Profile';
import GlobalStyle from './GlobalStyle';
import { DEVICE_TYPES } from '../constants';
import LeftPanel from './LeftPanel';

const App = () => {
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [nft, setNFT] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer); // eslint-disable-line
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer); // eslint-disable-line
    // TODO @Enes: Rename above two variables again and remove eslint line above
    setNFT(nft);
    setLoading(false);
  };

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();

    window.ethereum.on('chainChanged', (chainId) => { //eslint-disable-line
      // TODO @Enes: React to chain changes and remove eslint line above
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async (accounts) => { //eslint-disable-line
      // TODO @Enes: Rename accounts variable later
      setAccount(accounts[0]);
      await web3Handler();
    });
    loadContracts(signer);
  };

  return (
    <BrowserRouter>
      <GlobalStyle />
      <div className="App">
        { deviceType !== DEVICE_TYPES.DESKTOP && (
          <LeftPanel
            nodeRef={leftPanelRef}
            isLeftPanelOpened={isLeftPanelOpened}
            toggleLeftPanel={toggleLeftPanel}
          />
        )}
        <NavigationBar
          web3Handler={web3Handler}
          loading={loading}
          account={account}
          deviceType={deviceType}
          toggleLeftPanel={toggleLeftPanel}
        />
        { loading ? <div>Waiting for Metamask connection...</div>
          : (
            <Routes>
              <Route exact path="/" element={<HomePage nft={nft} marketplace={marketplace} />} />
              <Route path="/user/*" element={<Profile account={account} />} />
              <Route path="/mint-nfts" element={<MintNFTSPage nft={nft} marketplace={marketplace} />} />
              <Route path="/my-listed-nfts" element={<ListNFTSPage nft={nft} marketplace={marketplace} account={account} />} />
              <Route path="/my-purchases" element={<PurchasesPage nft={nft} marketplace={marketplace} account={account} />} />
            </Routes>
          )}
      </div>
    </BrowserRouter>
  );
};

export default App;
