import React, { useState, useEffect } from 'react';
import { TfiArrowCircleRight, TfiArrowCircleLeft } from 'react-icons/tfi';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';

const ScListNFTS = styled.div`
  .nft-slider-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  svg {
    height: 100%;
    width: 3%;
    color: var(--blue);
  }

  nav.indicators {
    width: 100%;
    text-align: center;
  }

  nav.indicators ul {
    display: inline-block;
    text-align: center;
    position: relative;
  }

  nav.indicators ul li button.current {
    background-color: var(--blue);
  }

  nav.indicators ul li button {
    width: 20px;
    height: 20px;
    border-radius: 10px;
    margin: 0 10px;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  nav.indicators ul li {
    display: inline-block;
    width: 20px;
    margin: 0 10px;
  }
`;

const ListNFTSPage = ({ profileId, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [listedItems, setListedItems] = useState([]);
  const [listedItemCount, setListedItemCount] = useState(0);
  const [auctionItemCount, setAuctionItemCount] = useState(0);
  const [auctionItems, setAuctionItems] = useState([]);
  /* eslint-disable no-unused-vars */
  const [listedCurrentPage, setListedCurrentPage] = useState(1);
  const [auctionCurrentPage, setAuctionCurrentPage] = useState(1);
  /* eslint-enable no-unused-vars */
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const getItems = async isAuctionItems => {
    const itemCount = isAuctionItems ? await marketplaceContract.auctionItemCount() : await marketplaceContract.itemCount();
    if (isAuctionItems) setAuctionItemCount(parseInt(itemCount._hex, 16));
    else setListedItemCount(parseInt(itemCount._hex, 16));
    const currentPage = isAuctionItems ? auctionCurrentPage : listedCurrentPage;
    const items = [];
    for (let cursor = 0; itemCount - (currentPage - 1 + cursor) * 5 >= 1; cursor += 1) {
      const itemsBegin = Math.max(1, itemCount - (currentPage - 1 + cursor) * 5);
      const itemsEnd = Math.max(itemsBegin - 5, 0);
      const itemIds = [];
      for (let i = itemsBegin; i > itemsEnd; i -= 1) {
        itemIds.push(i);
      }
      // eslint-disable-next-line no-await-in-loop
      const batchItems = await Promise.allSettled(
        itemIds.map(async indx => {
          const i = isAuctionItems ? await marketplaceContract.auctionItems(indx) : await marketplaceContract.items(indx);
          const soldCriteria = isAuctionItems ? i.claimed : i.sold;
          if (soldCriteria) return null;
          if (selectedTab !== 'Home' && i.seller.toLowerCase() !== profileId) return null;
          // get uri url from nft contract
          const uri = await nftContract.tokenURI(i.tokenId);
          const cid = uri.split('ipfs://')[1];
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(cid);
          // define listed item object
          if (isAuctionItems) {
            return {
              ...i,
              ...metadata
            };
          }
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
      const batchItemsResult = batchItems.filter(i => i.status === 'fulfilled' && i.value != null).map(i => i.value);
      items.push(...batchItemsResult);
      if (items.length === 5) return items;
      if (items.length > 5) {
        items.length = 5;
        return items;
      }
    }
    return items;
  };
  const loadAuctionItems = async () => getItems(true);
  const loadListedItems = async () => getItems(false);

  const loadItems = async () => {
    const items = await Promise.allSettled([loadListedItems(), loadAuctionItems()]);
    const fulfilledItems = items.filter(item => item.status === 'fulfilled');
    const listedItemList = fulfilledItems[0].value;
    const auctionItemList = fulfilledItems[1].value;
    const itemsFlatten = fulfilledItems.map(i => i.value).flat(1);
    setListedItems(listedItemList);
    setAuctionItems(auctionItemList);
    setMarketplaceItems(itemsFlatten);
    setLoading(false);
  };

  useEffect(async () => {
    setLoading(true);
    await loadItems();
  }, [profileId, listedCurrentPage, auctionCurrentPage]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const indicatorClickHandler = (isAuction, index) => {
    if (isAuction) setAuctionCurrentPage(index);
    else setListedCurrentPage(index);
  };

  const placeHolderItems = [{}, {}, {}, {}, {}];
  if (selectedTab === 'Home') {
    return (
      <ScListNFTS>
        <div className="nft-slider-container">
          <TfiArrowCircleLeft onClick={() => setListedCurrentPage(prev => Math.max(1, prev - 1))} />
          <NFTShowcase NFTs={loading ? placeHolderItems : listedItems} loadItems={loadItems} selectedTab={selectedTab} loading={loading} />
          <TfiArrowCircleRight onClick={() => setListedCurrentPage(prev => Math.min(Math.ceil(listedItemCount / 5), prev + 1))} />
        </div>
        <nav className="indicators">
          <ul>
            {[...Array(Math.ceil(listedItemCount / 5) + 1).keys()].slice(1).map(value => (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => indicatorClickHandler(false, value)}
                  className={`${listedCurrentPage === value ? 'current' : ''}`}
                  aria-label={`Page ${value}`}
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="nft-slider-container">
          <TfiArrowCircleLeft onClick={() => setAuctionCurrentPage(prev => Math.max(1, prev - 1))} />
          <NFTShowcase NFTs={loading ? placeHolderItems : auctionItems} loadItems={loadItems} selectedTab={selectedTab} loading={loading} />
          <TfiArrowCircleRight onClick={() => setAuctionCurrentPage(prev => Math.min(Math.ceil(auctionItemCount / 5), prev + 1))} />
        </div>
        <nav className="indicators">
          <ul>
            {[...Array(Math.ceil(auctionItemCount / 5) + 1).keys()].slice(1).map(value => (
              <li key={value}>
                <button
                  type="button"
                  aria-label={`Page ${value}`}
                  key={value}
                  onClick={() => indicatorClickHandler(true, value)}
                  className={`${auctionCurrentPage === value ? 'current' : ''}`}
                />
              </li>
            ))}
          </ul>
        </nav>
      </ScListNFTS>
    );
  }
  return <NFTShowcase NFTs={marketplaceItems} loadItems={loadItems} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
