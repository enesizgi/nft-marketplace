import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import API from '../modules/api';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';

const NFTDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [transactions, setTransactions] = useState([]);
  const location = useLocation();
  const itemId = location.state.id;
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const loadNFTData = async () => {
    // TODO: Error handling
    const i = await marketplaceContract.items(itemId);
    const uri = await nftContract.tokenURI(i.tokenId);
    const cid = uri.split('ipfs://')[1];
    const metadata = await API.getFromIPFS(cid);
    const totalPrice = await marketplaceContract.getTotalPrice(i.itemId);
    // TODO: handle if data comes from ipfs
    const it = {
      ...metadata,
      totalPrice,
      price: i.price,
      itemId: i.itemId
    };

    setItem(it);
    // TODO: Cache mechanism for transactions maybe?
    const transferFilter = nftContract.filters.Transfer(null, null, i.tokenId);
    const transferEvents = await nftContract.queryFilter(transferFilter);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftTransactions = await Promise.all(
      transferEvents.map(async t => {
        const transaction = await provider.getTransaction(t.transactionHash);
        return transaction;
      })
    );

    setTransactions(nftTransactions);
    setLoading(false);
  };

  useEffect(async () => {
    await loadNFTData();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <div>
      {item.url && (
        <div className="nft-image">
          <img src={item.url} alt="nftImage" />
          <span className="nft-info-name-itemName">{ethers.utils.formatEther(item.totalPrice)}</span>
        </div>
      )}
    </div>
  );
};

export default NFTDetailPage;
