/* eslint-disable react/prop-types */
// TODO @Enes: Remove all eslint disables
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import API from '../modules/api';

const PurchasesPage = ({ nft, marketplace, account }) => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);

  const loadPurchasedItems = async () => {
    // eslint-disable-next-line max-len
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter = marketplace.filters.Bought(null, null, null, null, null, account);
    const results = await marketplace.queryFilter(filter);
    // Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(results.map(async i => { // eslint-disable-line no-shadow
      // TODO @Enes: Rename above variable to something else
      // fetch arguments from each result
      i = i.args; // eslint-disable-line no-param-reassign
      // get uri url from nft contract
      const uri = await nft.tokenURI(i.tokenId);
      // use uri to fetch the nft metadata stored on ipfs
      const metadata = await API.getFromIPFS(uri);
      // get total price of item (item price + fee)
      const totalPrice = await marketplace.getTotalPrice(i.itemId);
      // define listed item object
      return {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.data.name,
        description: metadata.data.description,
        image: metadata.data.image
      };
    }));
    setLoading(false);
    setPurchases(purchases);
  };
  useEffect(() => {
    loadPurchasedItems();
  }, []);
  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  // TODO @Enes: Find better way for Math.random below
  /* eslint-disable jsx-a11y/alt-text */
  return (
    <div className="imageContainer">
      {purchases.map(item => (
        <div key={`${item.image}-${Math.random()}`} className="imageItem">
          {/* <img src={item.image} alt={item.name} width='300px' /> */}
          {item.image && <img src={`data:${item.image.data.mimetype};base64,${item.image.data.data}`} width="300px" />}
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

export default PurchasesPage;
