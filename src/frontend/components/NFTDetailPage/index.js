import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { getMarketplaceContract, getNFTContract } from '../../store/selectors';
import './NFTDetailPage.css';
import AuctionButton from '../AuctionButton';
import NFTDetailBox from './NFTDetailBox';
import NFTDetailImage from './NFTDetailImage';
import NFTDetailHeader from './NFTDetailHeader';
import NFTDetailActivity from './NFTDetailActivity';

const NFTDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [transactions, setTransactions] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [owner, setOwner] = useState(null);
  const location = useLocation();
  const { item: _item } = location.state;
  // console.log('itemId', itemId, 'tokenId', item2);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const loadNFTData = async () => {
    // TODO: Error handling
    let i;
    let totalPrice;
    const { itemId, tokenId } = _item;
    if (itemId) {
      i = await marketplaceContract.items(itemId);
      totalPrice = await marketplaceContract.getTotalPrice(itemId);
    }
    // TODO: handle if data comes from ipfs
    const it = {
      ..._item,
      ...(i ?? {}),
      ...(totalPrice ? { totalPrice } : {}),
      ...(i?.price ? { price: i.price } : {})
    };

    setItem(it);
    const nftOwner = await nftContract.ownerOf(tokenId);
    setOwner(nftOwner);
    // TODO: Cache mechanism for transactions maybe?
    const transferFilter = nftContract.filters.Transfer(null, null, tokenId);
    const transferEvents = await nftContract.queryFilter(transferFilter);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftTransactions = await Promise.all(
      transferEvents.map(async t => {
        const transaction = await provider.getTransaction(t.transactionHash);
        return transaction;
      })
    );

    setTransactions(nftTransactions);

    // TODO: change the logic of the transaction detecting
    const nftTransactionData = await nftTransactions.map(t => {
      if (t.to === nftContract.address) {
        return { type: 0, price: null, from: 0, to: t.from };
      }
      console.log(ethers.utils.formatEther(t.value));
      if (Number(ethers.utils.formatEther(t.value)) === 0.0) {
        return { type: 1, price: null, from: t.from, to: t.to };
      }
      return { type: 2, price: ethers.utils.formatEther(t.value), from: t.to, to: t.from };
    });

    setTransactionData(nftTransactionData);
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
    <div className="item-wrapper">
      <div className="item-summary">
        <NFTDetailImage item={item} />
        <NFTDetailBox item={item} />
      </div>
      <div className="item-main">
        <NFTDetailHeader item={item} owner={owner} />
        <AuctionButton item={item} />
        <NFTDetailActivity item={item} transactions={transactionData} />
      </div>
    </div>
  );
};

export default NFTDetailPage;
