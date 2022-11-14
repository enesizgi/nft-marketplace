import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ethers } from 'ethers';
import HomePage from './Home';
import MintNFTSPage from './MintNFTS.js';
import ListNFTSPage from './ListNFTS.js';
import PurchasesPage from './Purchases.js';
import NavigationBar from './NavigationBar';

import MarketplaceAbi from '../contractsData/Marketplace.json';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import NFTAbi from '../contractsData/NFT.json';
import NFTAddress from '../contractsData/NFT-address.json';
import Profile from "./Profile";

function App() {
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [nft, setNFT] = useState(null);
  const [loading, setLoading] = useState(true);

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async (accounts) => {
      setAccount(accounts[0]);
      await web3Handler();
    });
    loadContracts(signer);
  };
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer);
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <NavigationBar web3Handler={web3Handler} loading={loading} />
        { loading ? <div>Waiting for Metamask connection...</div>
          : (
            <Routes>
              <Route exact path="/" element={<HomePage nft={nft} marketplace={marketplace} />} />
              <Route path="/mint-nfts" element={<MintNFTSPage nft={nft} marketplace={marketplace} />} />
              <Route path="/my-listed-nfts" element={<ListNFTSPage nft={nft} marketplace={marketplace} account={account} />} />
              <Route path="/my-purchases" element={<PurchasesPage nft={nft} marketplace={marketplace} account={account} />} />
              <Route exact path="/user/*" element={<Profile account={account} />} />
            </Routes>
          )}
      </div>
    </BrowserRouter>
  );
}

export default App;
