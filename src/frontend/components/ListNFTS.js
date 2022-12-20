/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';

const ListNFTSPage = ({ profileID, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [soldItems, setSoldItems] = useState([]);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplaceContract.itemCount();
    const listedItems = []; // eslint-disable-line
    const soldItems = []; // eslint-disable-line
    // TODO @Enes: Rename above two variables again
    for (let indx = 1; indx <= itemCount; indx += 1) {
      const i = await marketplaceContract.items(indx);
      if (!i.sold && i.seller.toLowerCase() === profileID) {
        // get uri url from nft contract
        const uri = await nftContract.tokenURI(i.tokenId);
        const cid = uri.split('ipfs://')[1];
        // use uri to fetch the nft metadata stored on ipfs
        const metadata = await API.getFromIPFS(cid);
        // get total price of item (item price + fee)
        const totalPrice = await marketplaceContract.getTotalPrice(i.itemId);
        // define listed item object
        const item = {
          ...i,
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
  // TODO @Enes: Implement sold items using soldItems variable above. Then remove eslint line above.
  /* eslint-disable jsx-a11y/alt-text */
  return <NFTShowcase NFTs={listedItems} loadItems={loadListedItems} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
