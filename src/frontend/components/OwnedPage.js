/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getNFTContract } from '../store/selectors';

const OwnedPage = ({ profileID }) => {
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState([]);
  const nftContract = useSelector(getNFTContract);

  const loadOwnedItems = async () => {
    const ownedCount = await nftContract.balanceOf(profileID);
    const ownedItemsLocal = [];
    for (let i = 0; i < ownedCount; i += 1) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(profileID, i);
      const uri = await nftContract.tokenURI(tokenId);
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
  return <NFTShowcase NFTs={ownedItems} loadItems={loadOwnedItems} />;
};

export default OwnedPage;
