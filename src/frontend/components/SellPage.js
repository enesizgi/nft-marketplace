/* eslint-disable */
import React, { useState } from 'react';
import styled from 'styled-components';

const ScSellPage = styled.div`
  .sell-container {
    display: flex;
    flex-direction: column;
    margin-top: 30px;
    margin-left: 30px;
    display: inline-block;
  }

  .sell-button {
    background-color: #fff;
    border: 1px solid #666;
    border-radius: 5px;
    color: #000;
    padding: 10px 15px;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
  }
  .sell-label {
    display: flex;
    flex-direction: column;
    padding: 10px;
    margin-right: 20px;
  }

  .sell-button:hover {
    background: #eee;
    cursor: pointer;
  }

  .price-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid #666;
    border-radius: 5px;
    padding: 16px;
    > button {
      margin-left: 20px;
      height: 40px;
      background: ${({ theme }) => theme.blue};
      width: 100px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      border: 0;
      border-radius: 10px;
      cursor: pointer;
    }
  }

  .text1 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .duration-container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid #666;
    border-radius: 5px;
    padding: 16px;
  }
  .summary {
    border: 1px solid #666;
    border-radius: 5px;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
`;

const SellPage = () => {
  const [currentType, setType] = useState('sell');
  const [sellPrice, setPrice] = useState('');
  const [expireTime, setTime] = useState(null);

  const handleSellClicked = () => {
    setType('sell');
  };

  const handleAuctionClicked = () => {
    setType('auction');
  };

  const setSellPrice = value => {
    setPrice(value);
  };
  const setExpireTime = value => {
    setTime(value);
  };

  return (
    <ScSellPage>
      <div className="sell-container">
        <header className="sell-header"> List for Sale</header>
        <label className="sell-button">
          <div className="sell-label">
            <span> Fixed Price</span>
            <span> The item is listed at the price you set.</span>
          </div>
          <input type="radio" value="sell" checked={currentType === 'sell'} onClick={handleSellClicked} />
        </label>
        <label className="sell-button">
          <div className="sell-label">
            <span> Auction</span>
            <span> Time based auction.</span>
          </div>
          <input type="radio" value="auction" checked={currentType === 'auction'} onClick={handleAuctionClicked} />
        </label>
        <div className="price-container button">
          <label className="text1" htmlFor="sell-number">
            Set Price
          </label>
          <input id="sell-number" type="number" onChange={e => setSellPrice(e.target.value)} />
        </div>
        {currentType === 'auction' && (
          <div className="duration-container">
            <span> Set Duration</span>
            <input type="datetime-local" onChange={e => setExpireTime(e.target.value)} />
          </div>
        )}
        <div className="summary">
          <header> Summary</header>
          <span> Listing Price {parseInt(sellPrice)} </span>
          <span> Fee Percent %1</span>
          <span> Estimated Earning {parseInt(sellPrice) * 0.99}</span>
        </div>
      </div>
    </ScSellPage>
  );
};

export default SellPage;
