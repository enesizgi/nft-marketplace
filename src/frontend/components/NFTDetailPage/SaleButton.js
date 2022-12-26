import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { getUserID } from '../../store/selectors';

const ScSaleButton = styled.div`
  margin-bottom: 20px;
  border: 3px dashed var(--blue);
  border-radius: 16px;
  padding: 16px;

  .item {
    margin-bottom: 8px;
  }

  .nftActionButton {
    background: none;
    border: 2px solid var(--blue);
    cursor: pointer;
    padding: 8px 16px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .nftActionButton:hover {
    background: var(--blue);
    color: white;
  }

  .price {
    font-weight: bold;
    font-size: 20px;
  }
`;

const SaleButton = ({ item, isSeller, isOwner }) => {
  // console.log('item');
  // return null;
  const userID = useSelector(getUserID);
  // TODO: Implement button actions with sell and buy page
  const handleSell = async () => {
    console.log('SELL');
  };
  const handleCancel = async () => {
    console.log('Cancel');
  };
  const handleBuy = async () => {
    console.log('Buy');
  };

  if (!userID) {
    return null;
  }
  return (
    <ScSaleButton>
      {isOwner && (
        <div className="item">
          <button type="button" className="nftActionButton" onClick={handleSell}>
            Sell
          </button>
        </div>
      )}
      {isSeller && (
        <div className="item">
          <div className="item price">{ethers.utils.formatEther(item.price)} ETH</div>
          <button type="button" className="nftActionButton" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
      {!isOwner && !isSeller && (
        <div className="item">
          <div className="item price">{ethers.utils.formatEther(item.price)} ETH</div>
          <button type="button" className="nftActionButton" onClick={handleBuy}>
            Buy
          </button>
        </div>
      )}
    </ScSaleButton>
  );
};

export default SaleButton;
