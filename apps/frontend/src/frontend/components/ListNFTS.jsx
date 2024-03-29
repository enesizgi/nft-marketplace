import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getDeviceType, getMarketplaceContract, getNFTContract } from '../store/selectors';
import NFTSlider from './NFTSlider';
import { DEVICE_TYPES, theme } from '../constants';

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
      .nftCard-container {
        padding: 0 16px;
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
  const deviceType = useSelector(getDeviceType);
  const isMobile = deviceType === DEVICE_TYPES.MOBILE;

  const onePageNftCount = isMobile ? 1 : 8;

  useEffect(() => {
    (async () => {
      const listedPromise = API.getNftCount({
        type: 'Listing',
        sold: false,
        canceled: false,
        marketplaceContract: marketplaceContract.address
      });
      const auctionPromise = API.getNftCount({
        type: 'Auction',
        claimed: false,
        canceled: false,
        ...(selectedTab === 'Home' && { timeToEnd: new Date().getTime() }),
        marketplaceContract: marketplaceContract.address
      });
      const [{ count: listedCount }, { count: auctionCount }] = await Promise.all([listedPromise, auctionPromise]);
      setListedItemCount(listedCount);
      setAuctionItemCount(auctionCount);
    })();
  }, [marketplaceContract.address, selectedTab]);

  useEffect(() => {
    (async () => {
      if (!marketplaceContract?.address || !nftContract.address) return;
      setListedItemsLoading(true);
      const items = [];
      const mongoItems = await API.getNftStatus({
        marketplaceContract: marketplaceContract.address,
        type: 'Listing',
        sold: false,
        canceled: false,
        limit: onePageNftCount,
        skip: (listedCurrentPage - 1) * onePageNftCount
      });
      const batchItems = await Promise.allSettled(
        mongoItems.map(async i => {
          if (selectedTab !== 'Home' && i.seller.toLowerCase() !== profileId) return null;
          // get uri url from nft contract
          const uri = await nftContract.tokenURI(i.tokenId);
          const cid = uri.split('ipfs://')[1];
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(cid);
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
      setListedItems(items);
      setMarketplaceItems(prev => [items, prev[1]]);
      setListedItemsLoading(false);
    })();
  }, [listedCurrentPage, marketplaceContract, nftContract, profileId, selectedTab]);

  useEffect(() => {
    (async () => {
      if (!marketplaceContract?.address || !nftContract.address) return;
      setAuctionItemsLoading(true);
      const items = [];
      const mongoItems = await API.getNftStatus({
        marketplaceContract: marketplaceContract.address,
        type: 'Auction',
        limit: onePageNftCount,
        skip: (auctionCurrentPage - 1) * onePageNftCount,
        canceled: false,
        claimed: false,
        ...(selectedTab === 'Home' && { timeToEnd: new Date().getTime() })
      });
      const batchItems = await Promise.allSettled(
        mongoItems.map(async i => {
          if (selectedTab !== 'Home' && i.seller.toLowerCase() !== profileId) return null;
          // get uri url from nft contract
          const uri = await nftContract.tokenURI(i.tokenId);
          const cid = uri.split('ipfs://')[1];
          // use uri to fetch the nft metadata stored on ipfs
          const metadata = await API.getFromIPFS(cid);
          // define listed item object
          return {
            ...i,
            ...metadata
          };
        })
      );
      const batchItemsResult = batchItems.filter(i => i.status === 'fulfilled' && i.value != null).map(i => i.value);
      items.push(...batchItemsResult);
      setAuctionItems(items);
      setMarketplaceItems(prev => [prev[0], items]);
      setAuctionItemsLoading(false);
    })();
  }, [auctionCurrentPage, marketplaceContract, nftContract, profileId, selectedTab]);

  if (selectedTab === 'Home') {
    if (listedItemCount === 0 && auctionItemCount === 0) {
      return null;
    }
    return (
      <ScListNFTSPage>
        {listedItemCount && (
          <NFTSlider
            itemCount={listedItemCount}
            selectedTab={selectedTab}
            loading={listedItemsLoading}
            currentPage={listedCurrentPage}
            setCurrentPage={setListedCurrentPage}
            items={listedItems}
            onePageNftCount={onePageNftCount}
          />
        )}
        {auctionItemCount && (
          <NFTSlider
            itemCount={auctionItemCount}
            selectedTab={selectedTab}
            loading={auctionItemsLoading}
            currentPage={auctionCurrentPage}
            setCurrentPage={setAuctionCurrentPage}
            items={auctionItems}
            onePageNftCount={onePageNftCount}
          />
        )}
      </ScListNFTSPage>
    );
  }
  return <NFTShowcase NFTs={marketplaceItems.flat(1)} selectedTab={selectedTab} />;
};

export default ListNFTSPage;
