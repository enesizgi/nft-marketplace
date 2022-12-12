/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove these eslint disables
import React, { useState, useEffect } from 'react';
import API from '../../modules/api';
import NFTShowcase from '../NFTShowcase';

const HomePage = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await marketplace.itemCount();
    const items = []; // eslint-disable-line
    for (let i = 1; i <= itemCount; i += 1) {
      const item = await marketplace.items(i);
      try {
        if (!item.sold) {
          // get uri url from nft contract
          const uri = await nft.tokenURI(item.tokenId);
          const cid = uri.split('ipfs://')[1];
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(cid, 3000);
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(item.itemId);
          // Add item to items array
          items.push({
            ...metadata,
            totalPrice,
            itemId: item.itemId,
            seller: item.seller
          });
        }
      } catch (e) {
        console.warn(e);
      }
    }
    setLoading(false);
    setItems(items);
  };

  useEffect(() => {
    if (marketplace && nft) {
      loadMarketplaceItems();
    }
  }, [marketplace, nft]);

  if (loading) {
    return <h2>Loading...</h2>;
  }
  if (items.length > 0) {
    return <NFTShowcase NFTs={items} marketplace={marketplace} loadItems={loadMarketplaceItems} isOwner={false} nft={nft} account={account} />;
  }
  return <div>Home</div>;
};

export default HomePage;
