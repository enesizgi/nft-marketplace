import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import sortedUniqBy from 'lodash/sortedUniqBy';
import { getDeviceType, getMarketplaceContract, getNFTContract, getProfileID } from '../../store/selectors';
import AuctionButton from '../AuctionButton';
import NFTDetailBox from './NFTDetailBox';
import NFTDetailImage from './NFTDetailImage';
import NFTDetailHeader from './NFTDetailHeader';
import NFTDetailActivity from './NFTDetailActivity';
import { DEVICE_TYPES, NFT_ACTIVITY_TYPES } from '../../constants';
import ScNFTDetailPage from './ScNFTDetailPage';
import SaleButton from './SaleButton';

const NFTDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [transactions, setTransactions] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [isListed, setListed] = useState(false);
  const [onAuction, setOnAuction] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [owner, setOwner] = useState(null);
  const location = useLocation();
  const { item: _item } = location.state;

  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const deviceType = useSelector(getDeviceType);
  const profileID = useSelector(getProfileID);

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

    const boughtFilter = marketplaceContract.filters.Bought(null, null, it.tokenId, null, null, null);
    const boughtResults = await marketplaceContract.queryFilter(boughtFilter);
    const offeredFilter = marketplaceContract.filters.Offered(null, null, it.tokenId, null, null);
    const offeredResults = await marketplaceContract.queryFilter(offeredFilter);
    const auctionFilter = marketplaceContract.filters.AuctionStarted(null, null, it.tokenId, null, null, null);
    const auctionResults = await marketplaceContract.queryFilter(auctionFilter);

    const sortedEvents = [...boughtResults, ...offeredResults, ...auctionResults].sort((a, b) => b.blockNumber - a.blockNumber);
    const uniqEvents = sortedUniqBy(sortedEvents, n => n.args.tokenId.toBigInt());
    const lastEvent = uniqEvents[0];

    if (nftOwner === marketplaceContract.address) {
      if (lastEvent.event === 'Offered') {
        console.log('offered');
        setListed(true);
        setIsSeller(lastEvent.args[4].toLowerCase() === profileID.toLowerCase());
      } else if (lastEvent.event === 'AuctionStarted') {
        console.log('onAuction');
        setOnAuction(true);
        setIsSeller(lastEvent.args[5].toLowerCase() === profileID.toLowerCase());
      }
    }

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
            {isListed && <SaleButton item={item} isSeller={isSeller} isOwner={owner.toLowerCase() === profileID.toLowerCase()} />}
            {onAuction && <AuctionButton item={item} />}
            {owner.toLowerCase() === profileID.toLowerCase() && (
              <>
                <SaleButton item={item} isSeller={isSeller} isOwner={owner.toLowerCase() === profileID.toLowerCase()} />
                <AuctionButton item={item} owner={owner} />
              </>
            )}
          </>
        )}
        <NFTDetailActivity transactions={transactionData} />
      </div>
    </ScNFTDetailPage>
  );
};

export default NFTDetailPage;
