import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import {
  getFormattedPrice,
  getItemID,
  getMarketplaceContract,
  getNFTContract,
  getNFTOwner,
  getNFTSeller,
  getTokenID,
  getUserID
} from '../../store/selectors';
import AuctionButton from '../AuctionButton';

const ScSaleButton = styled.div`
  .sell-buttons {
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
  }
  .sell-button {
    width: 30%;
    @media screen and (max-width: 768px) {
      width: 100%;
    }
    margin-right: 10px;
    font-size: 24px;
    background: var(--blue);
    color: #fff;
    border: 0;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
  }

  .sell {
    margin-bottom: 20px;
    display: flex;
    align-items: end;
    border: 3px dashed var(--blue);
    border-radius: 16px;
    padding: 16px;
    > button {
      margin-left: 20px;
      height: 40px;
      background: var(--blue);
      width: 100px;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      border: 0;
      border-radius: 10px;
      cursor: pointer;
    }
  }
  .input-sell {
    display: flex;
    flex-direction: column;
    > input {
      height: 40px;
      width: 200px;
      border: 2px solid #000;
      border-radius: 10px;
      padding: 10px;
      font-size: 18px;
    }
  }

  .text1 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  .buy {
    margin: 20px 0;
  }
`;

const SaleButton = () => {
  const owner = useSelector(getNFTOwner);
  const userID = useSelector(getUserID);
  const seller = useSelector(getNFTSeller);
  const tokenID = useSelector(getTokenID);
  const itemID = useSelector(getItemID);
  const formattedPrice = useSelector(getFormattedPrice);
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);

  const [isAuctionSelected, setIsAuctionSelected] = useState(false);
  const [isSellSelected, setIsSellSelected] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const isOwner = owner && userID && owner.toLowerCase() === userID.toLowerCase();
  const isSeller = seller && userID && seller.toLowerCase() === userID.toLowerCase();

  const handleSelectAuction = () => {
    setIsAuctionSelected(true);
    setIsSellSelected(false);
  };

  const handleSelectSell = () => {
    setIsAuctionSelected(false);
    setIsSellSelected(true);
  };

  const handleSellNFT = async () => {
    const isApproved = await nftContract.isApprovedForAll(userID, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    await (await marketplaceContract.makeItem(nftContract.address, tokenID, listingPrice)).wait();
  };

  const handleBuy = async () => {
    await (await marketplaceContract.purchaseItem(itemID, { value: ethers.utils.parseEther(formattedPrice) })).wait();
  };

  if (!userID) {
    return null;
  }

  return (
    <ScSaleButton>
      {isOwner && (
        <div className="sell-buttons">
          <button type="button" className="sell-button" onClick={handleSelectSell}>
            Sell Item
          </button>
          <button type="button" className="sell-button" onClick={handleSelectAuction}>
            Start Auction
          </button>
        </div>
      )}
      {isOwner && isAuctionSelected && <AuctionButton />}
      {isOwner && isSellSelected && (
        <div className="sell">
          <div className="input-sell">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="text1" htmlFor="sell-number">
              Set Price
            </label>
            <input id="sell-number" type="number" onChange={e => setSellPrice(e.target.value)} />
          </div>
          <button type="button" onClick={handleSellNFT} className="sell-price-button">
            Sell Item
          </button>
        </div>
      )}
      {!isOwner && (
        <div className="item">
          <div className="text1">{formattedPrice} ETH</div>
          <button type="button" className="sell-button buy" onClick={handleBuy}>
            {isSeller ? 'Cancel' : 'Buy'}
          </button>
        </div>
      )}
    </ScSaleButton>
  );
};

export default SaleButton;
