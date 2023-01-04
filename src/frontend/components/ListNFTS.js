import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';

const ListNFTSPage = ({ profileId, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  /* eslint-disable no-unused-vars */
  const [listedCurrentPage, setListedCurrentPage] = useState(1);
  const [auctionCurrentPage, setAuctionCurrentPage] = useState(1);
  /* eslint-enable no-unused-vars */
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const getItems = async isAuctionItems => {
    const itemCount = isAuctionItems ? await marketplaceContract.auctionItemCount() : await marketplaceContract.itemCount();
    const currentPage = isAuctionItems ? auctionCurrentPage : listedCurrentPage;
    const items = [];
    for (let cursor = 0; itemCount - (currentPage - 1 + cursor) * 5 >= 1; cursor += 1) {
      const itemsBegin = Math.max(1, itemCount - (currentPage - 1 + cursor) * 5);
      const itemsEnd = Math.max(itemsBegin - 5, 0);
      const itemIds = [];
      for (let i = itemsBegin; i > itemsEnd; i -= 1) {
        itemIds.push(i);
      }
      // eslint-disable-next-line no-await-in-loop
      const auctionItems = await Promise.allSettled(
        itemIds.map(async indx => {
          const i = isAuctionItems ? await marketplaceContract.auctionItems(indx) : await marketplaceContract.items(indx);
          const soldCriteria = isAuctionItems ? i.claimed : i.sold;
          if (soldCriteria) return null;
          if (selectedTab !== 'Home' && i.seller.toLowerCase() !== profileId) return null;
          // get uri url from nft contract
          const uri = await nftContract.tokenURI(i.tokenId);
          const cid = uri.split('ipfs://')[1];
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(cid);
          // define listed item object
          if (isAuctionItems) {
            return {
              ...i,
              ...metadata
            };
          }
          const totalPrice = await marketplaceContract.getTotalPrice(i.itemId);
          // define listed item object
          return {
            ...i,
            ...metadata,
            totalPrice,
            price: i.price,
            itemId: i.itemId
          };
        })
      );
      const batchItems = auctionItems.filter(i => i.status === 'fulfilled' && i.value != null).map(i => i.value);
      items.push(...batchItems);
      if (items.length === 5) return items;
      if (items.length > 5) {
        items.length = 5;
        return items;
      }
    }
    return items;
  };
  const loadAuctionItems = async () => getItems(true);
  const loadListedItems = async () => getItems(false);

  useEffect(async () => {
    const items = await Promise.allSettled([loadListedItems(), loadAuctionItems()]);
    const fulfilledItems = items.filter(item => item.status === 'fulfilled');
    const itemsFlatten = fulfilledItems.map(i => i.value).flat(1);
    setListedItems(itemsFlatten);
    setLoading(false);
  }, [profileId]);

  if (loading) {
    return <LoadingSpinner />;
  }
  return <NFTShowcase NFTs={listedItems} loadItems={loadListedItems} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
