import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';
import NFTSlider from './NFTSlider';

const ScListNFTSPage = styled.div`
  margin: 16px;

  @media screen and (max-width: 480px) {
    margin: 5px;
  }

  .nft-slider-container {
    margin-bottom: 16px;

    .nft-slider {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
    }

    svg {
      height: 100%;
      width: 3%;
      color: ${({ theme }) => theme.blue};
      opacity: 0.5;
      transition: all 0.2s ease-in-out;
    }

    svg:hover {
      opacity: 1;
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
      background-color: ${({ theme }) => theme.blue};
    }

    nav.indicators ul li button {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      margin: 0 10px;
      background-color: rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    nav.indicators ul li button:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }

    nav.indicators ul li {
      display: inline-block;
      width: 20px;
      margin: 0 10px;
    }
  }
`;

const ListNFTSPage = ({ profileId, selectedTab }) => {
  const [loading, setLoading] = useState(true);
  const [marketplaceItems, setMarketplaceItems] = useState([[], []]);
  const [listedItems, setListedItems] = useState([]);
  const [listedItemCount, setListedItemCount] = useState(0);
  const [auctionItemCount, setAuctionItemCount] = useState(0);
  const [auctionItems, setAuctionItems] = useState([]);
  const [listedCurrentPage, setListedCurrentPage] = useState(1);
  const [auctionCurrentPage, setAuctionCurrentPage] = useState(1);
  const [listedItemsLoading, setListedItemsLoading] = useState(false);
  const [auctionItemsLoading, setAuctionItemsLoading] = useState(false);
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

  const loadItems = isAuction => async () => {
    const items = await (isAuction ? loadAuctionItems() : loadListedItems());
    if (isAuction) {
      setAuctionItems(items);
      setMarketplaceItems(prev => [prev[0], items]);
    } else {
      setListedItems(items);
      setMarketplaceItems(prev => [items, prev[1]]);
    }
  };

  const loadAllItems = async () => {
    await Promise.allSettled([loadItems(false)(), loadItems(true)()]);
  };

  useEffect(() => {
    const runAsync = async () => {
      setLoading(true);
      await Promise.allSettled([loadItems(false)(), loadItems(true)()]);
      setLoading(false);
    };
    runAsync();
  }, [profileId]);

  useEffect(() => {
    const runAsync = async () => {
      setListedItemsLoading(true);
      await loadItems(false)();
      setListedItemsLoading(false);
    };
    runAsync();
  }, [listedCurrentPage]);

  useEffect(() => {
    const runAsync = async () => {
      setAuctionItemsLoading(true);
      await loadItems(true)();
      setAuctionItemsLoading(false);
    };
    runAsync();
  }, [auctionCurrentPage]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (selectedTab === 'Home') {
    return (
      <ScListNFTSPage>
        <NFTSlider
          itemCount={listedItemCount}
          loadItems={loadItems(false)}
          selectedTab={selectedTab}
          loading={listedItemsLoading}
          currentPage={listedCurrentPage}
          setCurrentPage={setListedCurrentPage}
          items={listedItems}
        />
        <NFTSlider
          itemCount={auctionItemCount}
          loadItems={loadItems(true)}
          selectedTab={selectedTab}
          loading={auctionItemsLoading}
          currentPage={auctionCurrentPage}
          setCurrentPage={setAuctionCurrentPage}
          items={auctionItems}
        />
      </ScListNFTSPage>
    );
  }
  return <NFTShowcase NFTs={marketplaceItems.flat(1)} loadItems={loadAllItems} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
