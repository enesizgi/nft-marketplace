/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getNFTContract } from '../store/selectors';

const OwnedPage = ({ profileID, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState([]);
  const nftContract = useSelector(getNFTContract);

  const loadOwnedItems = async () => {
    const ownedCount = await nftContract.balanceOf(profileID);
    const ownedItemIds = [];
    for (let i = 0; i < ownedCount; i += 1) {
      ownedItemIds.push(i);
    }
    const ownedItemsLocal = await Promise.allSettled(
      ownedItemIds.map(async i => {
        const tokenId = await nftContract.tokenOfOwnerByIndex(profileID, i);
        const uri = await nftContract.tokenURI(tokenId);
        const cid = uri.split('ipfs://')[1];
        const metadata = await API.getFromIPFS(cid);
        return {
          ...metadata,
          tokenId
        };
      })
    );
    setOwnedItems(ownedItemsLocal.filter(i => i.status === 'fulfilled').map(i => i.value));
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
  return <NFTShowcase NFTs={ownedItems} loadItems={loadOwnedItems} selectedTab={selectedTab} />;
};

export default OwnedPage;
