/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove these eslint disables
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../../modules/api';
import NFTShowcase from '../NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../../store/selectors';

const HomePage = () => {
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await marketplaceContract.itemCount();
    const items = []; // eslint-disable-line
    for (let i = 1; i <= itemCount; i += 1) {
      const item = await marketplaceContract.items(i);
      try {
        if (!item.sold) {
          // get uri url from nft contract
          const uri = await nftContract.tokenURI(item.tokenId);
          const cid = uri.split('ipfs://')[1];
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(cid, 3000);
          // get total price of item (item price + fee)
          const totalPrice = await marketplaceContract.getTotalPrice(item.itemId);
          // Add item to items array
          items.push({
            ...item,
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
    if (marketplaceContract && nftContract) {
      loadMarketplaceItems();
    }
  }, [marketplaceContract, nftContract]);

  if (loading) {
    return <h2>Loading...</h2>;
  }
  if (items.length > 0) {
    return <NFTShowcase NFTs={items} loadItems={loadMarketplaceItems} />;
  }
  return <div>Home</div>;
};

export default HomePage;
