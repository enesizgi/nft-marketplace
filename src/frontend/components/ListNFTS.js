/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import NFTCard from './NFTCard';
import API from '../modules/api';

const ListNFTSPage = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplace.itemCount();
    const listedItems = []; // eslint-disable-line
    const soldItems = []; // eslint-disable-line
    // TODO @Enes: Rename above two variables again
    for (let indx = 1; indx <= itemCount; indx += 1) {
      const i = await marketplace.items(indx);
      if (!i.sold && i.seller.toLowerCase() === account) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId);
        const cid = uri.split('ipfs://')[1];
        // use uri to fetch the nft metadata stored on ipfs
        const metadata = await API.getFromIPFS(cid);
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // define listed item object
        const item = {
          ...metadata,
          totalPrice,
          price: i.price,
          itemId: i.itemId
        };
        listedItems.push(item);
        // Add listed item to sold items array if sold
        if (i.sold) soldItems.push(item);
      }
    }
    setLoading(false);
    setListedItems(listedItems);
    setSoldItems(soldItems);
  };
  useEffect(async () => {
    await loadListedItems();
  }, []);
  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  return (
    <div className="imageContainer">
      {listedItems
        .filter(item => !soldItems.find(i => i.itemId === item.itemId))
        .map(item => (
          <NFTCard
            key={`${item.url}-${Math.random()}`}
            item={item}
            marketplace={marketplace}
            nft={nft}
            account={account}
            loadMarketplaceItems={loadListedItems}
          />
        ))}
    </div>
  );
};

export default ListNFTSPage;
