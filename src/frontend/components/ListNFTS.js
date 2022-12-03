/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import API from '../modules/api';

const ListNFTSPage = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]); // eslint-disable-line
  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplace.itemCount();
    const listedItems = []; // eslint-disable-line
    const soldItems = []; // eslint-disable-line
    // TODO @Enes: Rename above two variables again
    for (let indx = 1; indx <= itemCount; indx += 1) {
      const i = await marketplace.items(indx);
      if (i.seller.toLowerCase() === account) {
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
  useEffect(() => {
    loadListedItems();
  }, []);
  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  // TODO @Enes: Implement sold items using soldItems variable above. Then remove eslint line above.
  /* eslint-disable jsx-a11y/alt-text */
  return (
    <div className="imageContainer">
      {listedItems.filter(item => !soldItems.find(i => i.itemId === item.itemId)).map(item => (
        <div key={`${item.url}-${Math.random()}`} className="imageItem">
          {item.url && <img src={item.url} alt={item.cid} width="300px" />}
          <div className="imageItemInfo">
            <div className="imageItemName">
              Name:
              {item.name}
            </div>
            <div className="imageItemDescription">
              Description:
              {item.description}
            </div>
            <div className="imageItemPrice">
              Price:
              {ethers.utils.formatEther(item.totalPrice)}
              {' '}
              ETH
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListNFTSPage;
