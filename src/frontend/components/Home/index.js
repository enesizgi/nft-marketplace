/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove these eslint disables
import React, { useState, useEffect } from 'react';
import API from '../../modules/api';
import NFTCard from "../NFTCard";

const HomePage = ({ marketplace, nft }) => {
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
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(uri, 3000);
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(item.itemId);
          // Add item to items array
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.data.name,
            description: metadata.data.description,
            image: metadata.data.image
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
    loadMarketplaceItems();
  }, []);

  if (loading) {
    return (
      <h2>Loading...</h2>
    );
  }
  /* eslint-disable jsx-a11y/alt-text,react/button-has-type */
  // TODO @Enes: Remove this eslint disable
  if (items.length > 0) {
    return (
      <div className="imageContainer">
        {items.map(item => (
          <NFTCard key={`${item.image}-${Math.random()}`} item={item} loadMarketplaceItems={loadMarketplaceItems} marketplace={marketplace} />
        ))}
      </div>
    );
  }
  return <div>Home</div>;
};

export default HomePage;
