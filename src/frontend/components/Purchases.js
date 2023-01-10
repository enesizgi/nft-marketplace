import React, { useEffect, useState } from 'react';
import sortedUniqBy from 'lodash/sortedUniqBy';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';

const PurchasesPage = ({ profileId, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);

  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const boughtFilter = marketplaceContract.filters.Bought(null, null, null, null, null, profileId);
    const boughtResults = await marketplaceContract.queryFilter(boughtFilter);
    const offeredFilter = marketplaceContract.filters.Offered(null, null, null, null, profileId);
    const offeredResults = await marketplaceContract.queryFilter(offeredFilter);

    const sortedEvents = [...boughtResults, ...offeredResults].sort((a, b) => b.blockNumber - a.blockNumber);
    const uniqEvents = sortedUniqBy(sortedEvents, i => i.args.tokenId.toBigInt());
    const boughtItems = uniqEvents.filter(i => i.event === 'Bought');
    // Fetch metadata of each nft and add that to listedItem object.
    // eslint-disable-next-line no-shadow
    const purchases = await Promise.all(
      boughtItems.map(async i => {
        // TODO @Enes: Rename above variable to something else
        // fetch arguments from each result
        i = i.args; // eslint-disable-line no-param-reassign
        // get uri url from nft contract
        const uri = await nftContract.tokenURI(i.tokenId);
        const cid = uri.split('ipfs://')[1];
        // use uri to fetch the nft metadata stored on ipfs
        const metadata = await API.getFromIPFS(cid);
        // get total price of item (item price + fee)
        const totalPrice = await marketplaceContract.getTotalPrice(i.itemId);
        // define listed item object
        return {
          ...i,
          ...metadata,
          totalPrice,
          price: i.price,
          itemId: i.itemId
        };
      })
    );
    setLoading(false);
    setPurchases(purchases);
  };

  useEffect(() => {
    loadPurchasedItems();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }
  // TODO @Enes: Find better way for Math.random below

  return <NFTShowcase NFTs={purchases} loadItems={loadPurchasedItems} selectedTab={selectedTab} />;
};

export default PurchasesPage;
