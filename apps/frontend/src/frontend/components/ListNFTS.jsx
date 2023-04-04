import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getMarketplaceContract, getNFTContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';
import NFTSlider from './NFTSlider';
import { theme } from '../constants';

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
      & > svg {
        cursor: pointer;
        height: 100%;
        width: 3%;
        color: ${theme.blue};
        transition: all 0.2s ease-in-out;
        &:hover {
          filter: brightness(120%);
        }
      }
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
      background-color: ${theme.blue};
    }

    nav.indicators ul li button {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      margin: 0 10px;
      background-color: ${theme.secondaryBlue};
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    nav.indicators ul li button:hover {
      filter: brightness(130%);
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
    const { count: itemCount } = isAuctionItems
      ? await API.getNftCount({ type: 'Auction', claimed: false, canceled: false, timeToEnd: new Date().getTime() })
      : await API.getNftCount({ type: 'Listing', sold: false, canceled: false });
    if (isAuctionItems) setAuctionItemCount(itemCount);
    else setListedItemCount(itemCount);
    const currentPage = isAuctionItems ? auctionCurrentPage : listedCurrentPage;
    const items = [];
    const activeCriteria = isAuctionItems ? { canceled: false, claimed: false, timeToEnd: new Date().getTime() } : { sold: false, canceled: false };
    const mongoItems = await API.getNftStatus({
      type: isAuctionItems ? 'Auction' : 'Listing',
      limit: 5,
      skip: (currentPage - 1) * 5,
      ...activeCriteria
    });
    // eslint-disable-next-line no-await-in-loop
    const batchItems = await Promise.allSettled(
      mongoItems.map(async i => {
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
  }, [profileId, marketplaceContract, nftContract]);

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
        {listedItemCount && (
          <NFTSlider
            itemCount={listedItemCount}
            loadItems={loadItems(false)}
            selectedTab={selectedTab}
            loading={listedItemsLoading}
            currentPage={listedCurrentPage}
            setCurrentPage={setListedCurrentPage}
            items={listedItems}
          />
        )}
        {auctionItemCount && (
          <NFTSlider
            itemCount={auctionItemCount}
            loadItems={loadItems(true)}
            selectedTab={selectedTab}
            loading={auctionItemsLoading}
            currentPage={auctionCurrentPage}
            setCurrentPage={setAuctionCurrentPage}
            items={auctionItems}
          />
        )}
      </ScListNFTSPage>
    );
  }
  return <NFTShowcase NFTs={marketplaceItems.flat(1)} loadItems={loadAllItems} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
