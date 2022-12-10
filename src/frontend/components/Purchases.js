/* eslint-disable react/prop-types */
// TODO @Enes: Remove all eslint disables
import React, { useEffect, useState } from 'react';
import sortedUniqBy from 'lodash/sortedUniqBy';
import NFTCard from './NFTCard';
import API from '../modules/api';

const PurchasesPage = ({ nft, marketplace, account }) => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const loadPurchasedItems = async () => {
    // eslint-disable-next-line max-len
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const boughtFilter = marketplace.filters.Bought(null, null, null, null, null, account);
    const boughtResults = await marketplace.queryFilter(boughtFilter);
    const offeredFilter = marketplace.filters.Offered(null, null, null, null, account);
    const offeredResults = await marketplace.queryFilter(offeredFilter);

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
        const uri = await nft.tokenURI(i.tokenId);
        const cid = uri.split('ipfs://')[1];
        // use uri to fetch the nft metadata stored on ipfs
        const metadata = await API.getFromIPFS(cid);
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // define listed item object
        return {
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
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  // TODO @Enes: Find better way for Math.random below

  return (
    <div className="imageContainer">
      {purchases.map(item => (
        <NFTCard
          key={`${item.url}-${Math.random()}`}
          item={item}
          account={account}
          marketplace={marketplace}
          nft={nft}
          loadMarketplaceItems={loadPurchasedItems}
          showSellButton
        />
      ))}
    </div>
  );
};

export default PurchasesPage;
