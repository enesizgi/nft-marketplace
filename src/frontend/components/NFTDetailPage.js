import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { TiArrowSortedUp, TiArrowSortedDown } from 'react-icons/ti';
import { ethers } from 'ethers';
import API from '../modules/api';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';
import './NFTDetailPage.css';

const NFTDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState(false);
  const [details, setDetails] = useState(false);
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
      ...i,
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

  const openDesciption = () => {
    setDescription(!description);
  };

  const openDetails = () => {
    setDetails(!details);
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
    <div className="nft-detail-img">
      <div className="nft-detail-img-box">
        <div className="nft-detail-img-box-nft">
          <div className="nft-detail-img-box-nft-img">{item.url && <img src={item.url} className="nftImage" alt="NFT" />}</div>
        </div>
        <button type="button" className="nft-detail-img-box-a" onClick={openDesciption}>
          <p>Description</p>
          {description ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
        </button>
        {description && item.description && (
          <div className="nft-detail-img-box-description-box">
            <p> item.description </p>
          </div>
        )}
        <button type="button" className="nft-detail-img-box-detail" onClick={openDetails}>
          <p>Details</p>
          {details ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
        </button>
        {details && (
          <div className="nft-detail-img-box-detail-box">
            <p>
              <small>Contract Address</small>
              <br />
              0x000000f
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* <div className="item-container"> 
    <div className = "item-header"><h1>TEST</h1></div>
      {item.url && (
        <div className="nft-image">
          <img src={item.url} alt="nftImage" />
        </div>
      )}
      <span className="nft-info-name-itemName">{ethers.utils.formatEther(item.totalPrice)}</span>
    </div> */

export default NFTDetailPage;
