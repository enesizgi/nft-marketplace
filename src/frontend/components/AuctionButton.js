import React from 'react';
import { useSelector } from 'react-redux';
import { getMarketplaceContract, getNFTContract, getUserID } from '../store/selectors';
/* eslint-disable */
const AuctionButton = ({ item }) => {
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const userID = useSelector(getUserID);
  console.log('item', item);

  const onClickHandler = async () => {
    console.log('clicked');
  };

  return (
    <button type="button" onClick={onClickHandler}>
      Auction
    </button>
  );
};

export default AuctionButton;
