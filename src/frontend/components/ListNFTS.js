/* eslint-disable react/prop-types */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';

const ListNFTSPage = ({ profileID, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const loadAuctionItems = async () => {
    const itemCount = await marketplaceContract.auctionItemCount();
    // const auctionItems = [];
    const auctionItemsIds = [];
    // Create an array of all auction item ids starts from 1 to auctionItemCount
    for (let i = 1; i <= itemCount; i += 1) {
      auctionItemsIds.push(i);
    }

    const auctionItems = await Promise.allSettled(
      auctionItemsIds.map(async indx => {
        const i = await marketplaceContract.auctionItems(indx);
        if (i.claimed) return null;
        if (selectedTab !== 'Home' && i.seller.toLowerCase() !== profileID) return null;
        // get uri url from nft contract
        const uri = await nftContract.tokenURI(i.tokenId);
        const cid = uri.split('ipfs://')[1];
        // use uri to fetch the nft metadata stored on ipfs
        const metadata = await API.getFromIPFS(cid);
        // define listed item object
        return {
          ...i,
          ...metadata
        };
      })
    );
    return auctionItems.filter(i => i.status === 'fulfilled' && i.value != null).map(i => i.value);
  };
  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplaceContract.itemCount();
    const offeredItemIds = [];
    // TODO @Enes: Rename above two variables again
    for (let i = 1; i <= itemCount; i += 1) {
      offeredItemIds.push(i);
    }

    const offeredItems = await Promise.allSettled(
      offeredItemIds.map(async indx => {
        const i = await marketplaceContract.items(indx);
        if (i.sold || i.seller.toLowerCase() !== profileID) return null;
        // get uri url from nft contract
        const uri = await nftContract.tokenURI(i.tokenId);
        const cid = uri.split('ipfs://')[1];
        // use uri to fetch the nft metadata stored on ipfs
        const metadata = await API.getFromIPFS(cid);
        // get total price of item (item price + fee)
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
    return offeredItems.filter(i => i.status === 'fulfilled' && i.value != null).map(i => i.value);
  };

  useEffect(async () => {
    const items = await Promise.allSettled([loadListedItems(), loadAuctionItems()]);
    const itemsFlatten = items.map(i => i.value).flat(1);
    setListedItems(itemsFlatten);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  return <NFTShowcase NFTs={listedItems} loadItems={loadListedItems} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
