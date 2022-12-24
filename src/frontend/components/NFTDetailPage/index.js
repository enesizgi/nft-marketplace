import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { getDeviceType, getMarketplaceContract, getNFTContract } from '../../store/selectors';
import AuctionButton from '../AuctionButton';
import NFTDetailBox from './NFTDetailBox';
import NFTDetailImage from './NFTDetailImage';
import NFTDetailHeader from './NFTDetailHeader';
import NFTDetailActivity from './NFTDetailActivity';
import { DEVICE_TYPES, NFT_ACTIVITY_TYPES } from '../../constants';
import ScNFTDetailPage from './ScNFTDetailPage';

const NFTDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [transactions, setTransactions] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [owner, setOwner] = useState(null);
  const location = useLocation();
  const { item: _item } = location.state;

  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const deviceType = useSelector(getDeviceType);

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
    setOwner(nftOwner.toLowerCase());
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
    const nftTransactionData = nftTransactions.map(t => {
      const from = t.from.toLowerCase();
      const to = t.to.toLowerCase();
      const contractAddress = nftContract.address.toLowerCase();
      if (to === contractAddress) {
        return { type: NFT_ACTIVITY_TYPES.MINT, price: '', from: 'Null', to: from };
      }

      if (Number(ethers.utils.formatEther(t.value)) === 0.0) {
        return { type: NFT_ACTIVITY_TYPES.TRANSFER, price: '', from, to };
      }
      return { type: NFT_ACTIVITY_TYPES.SALE, price: ethers.utils.formatEther(t.value), from: to, to: from };
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
    <ScNFTDetailPage>
      {deviceType !== DEVICE_TYPES.DESKTOP && <NFTDetailHeader item={item} owner={owner} />}
      <div className="item-summary">
        <NFTDetailImage item={item} />
        <NFTDetailBox item={item} />
      </div>
      <div className="item-main">
        {deviceType === DEVICE_TYPES.DESKTOP && (
          <>
            <NFTDetailHeader item={item} owner={owner} />
            <AuctionButton item={item} />
          </>
        )}
        <NFTDetailActivity transactions={transactionData} />
      </div>
    </ScNFTDetailPage>
  );
};

export default NFTDetailPage;
