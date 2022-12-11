/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import NFTCard from './NFTCard';
import API from '../modules/api';

const OwnedPage = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState([]);
  const loadOwnedItems = async () => {
    const ownedCount = await nft.balanceOf(account);
    const ownedItemsLocal = [];
    for (let i = 0; i < ownedCount; i += 1) {
      const tokenId = await nft.tokenOfOwnerByIndex(account, i);
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
  return (
    <div className="imageContainer">
      {ownedItems.map(item => (
        <NFTCard
          key={`${item.url}-${Math.random()}`}
          item={item}
          marketplace={marketplace}
          nft={nft}
          account={account}
          loadMarketplaceItems={loadOwnedItems}
          showSellButton
        />
      ))}
    </div>
  );
};

export default OwnedPage;
