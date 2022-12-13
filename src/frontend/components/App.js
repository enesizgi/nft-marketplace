import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ethers } from 'ethers';
import HomePage from './Home';
import MintNFTSPage from './MintNFTS';
import ListNFTSPage from './ListNFTS';
import PurchasesPage from './Purchases';
import NavigationBar from './NavigationBar';
import API from '../modules/api';
import MarketplaceAbi from '../contractsData/Marketplace.json';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import NFTAbi from '../contractsData/NFT.json';
import NFTAddress from '../contractsData/NFT-address.json';
import Profile from './Profile';
import GlobalStyle from './GlobalStyle';
import { DEVICE_TYPES, JSON_RPC_PROVIDER } from '../constants';
import LeftPanel from './LeftPanel';
import { generateSignatureData } from '../utils';
import NFTDetailPage from './NFTDetailPage';

const App = () => {
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [nft, setNFT] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [chainId, setChainId] = useState(null);
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

  const loadContracts = async signerOrProvider => {
    // Get deployed copies of contracts
    const marketplaceContract = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signerOrProvider);
    setMarketplace(marketplaceContract);
    const nftContract = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signerOrProvider);
    setNFT(nftContract);
    setLoading(false);
  };

  const createNewUser = async id => {
    const { signature, message } = await generateSignatureData();
    return API.createUser(id, signature, message);
  };

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userID = accounts[0];
    const userExists = await API.checkUser(userID);

    if (!userExists) {
      const created = createNewUser(userID);
      if (!created) {
        console.warn('User could not be created.');
      }
    }

    setAccount(userID);

    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();

    window.ethereum.on('chainChanged', chainID => {
      // TODO @Enes: React to chain changes
      setChainId(chainID);
    });

    // eslint-disable-next-line
    window.ethereum.on('accountsChanged', async accounts => {
      // TODO @Enes: Rename accounts variable later
      setAccount(accounts[0]);
      await web3Handler();
    });
    loadContracts(signer);
  };

  useEffect(async () => {
    if (!account) {
      const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER);
      await loadContracts(provider);
    }
  }, [account]);

  return (
    <BrowserRouter>
      <GlobalStyle />
      <div className="App">
        {deviceType !== DEVICE_TYPES.DESKTOP && (
          <LeftPanel nodeRef={leftPanelRef} isLeftPanelOpened={isLeftPanelOpened} toggleLeftPanel={toggleLeftPanel} />
        )}
        <NavigationBar web3Handler={web3Handler} loading={loading} account={account} deviceType={deviceType} toggleLeftPanel={toggleLeftPanel} />
        <Routes>
          <Route exact path="/" element={<HomePage nft={nft} marketplace={marketplace} account={account} />} />
          <Route path="/user/*" element={<Profile account={account} nft={nft} marketplace={marketplace} />} />
          <Route path="/mint-nfts" element={<MintNFTSPage nft={nft} marketplace={marketplace} account={account} />} />
          <Route path="/my-listed-nfts" element={<ListNFTSPage nft={nft} marketplace={marketplace} account={account} />} />
          <Route path="/my-purchases" element={<PurchasesPage nft={nft} marketplace={marketplace} account={account} />} />
          <Route path="/nft/*" element={<NFTDetailPage nft={nft} marketplace={marketplace} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
