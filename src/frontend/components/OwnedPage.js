/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';

const OwnedPage = ({ marketplace, nft, account, isOwner, profileID }) => {
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState([]);
  const loadOwnedItems = async () => {
    const ownedCount = await nft.balanceOf(profileID);
    const ownedItemsLocal = [];
    for (let i = 0; i < ownedCount; i += 1) {
      const tokenId = await nft.tokenOfOwnerByIndex(profileID, i);
      const uri = await nft.tokenURI(tokenId);
      const cid = uri.split('ipfs://')[1];
      const metadata = await API.getFromIPFS(cid);
      const item = {
        ...metadata,
        tokenId
      };
      ownedItemsLocal.push(item);
    }
    setOwnedItems(ownedItemsLocal);
    setLoading(false);
  };
  useEffect(async () => {
    await loadOwnedItems();
  }, []);
  if (loading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  return <NFTShowcase NFTs={ownedItems} marketplace={marketplace} loadItems={loadOwnedItems} isOwner={isOwner} nft={nft} account={account} />;
};

export default OwnedPage;
