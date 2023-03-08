import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import {
  getFormattedPrice,
  getItemId,
  getMarketplaceContract,
  getNFTContract,
  getNFTOwner,
  getNFTSeller,
  getTokenId,
  getUserId
} from '../../store/selectors';
import AuctionButton from '../AuctionButton';
import { loadNFT } from '../../store/uiSlice';

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
    background: ${({ theme }) => theme.blue};
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
    border: 3px dashed ${({ theme }) => theme.blue};
    border-radius: 16px;
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
  const dispatch = useDispatch();
  const owner = useSelector(getNFTOwner);
  const userId = useSelector(getUserId);
  const seller = useSelector(getNFTSeller);
  const tokenId = useSelector(getTokenId);
  const itemId = useSelector(getItemId);
  const formattedPrice = useSelector(getFormattedPrice);
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);

  const [isAuctionSelected, setIsAuctionSelected] = useState(false);
  const [isSellSelected, setIsSellSelected] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const isOwner = owner && userId && owner.toLowerCase() === userId.toLowerCase();
  const isSeller = seller && userId && seller.toLowerCase() === userId.toLowerCase();

  const handleSelectAuction = () => {
    setIsAuctionSelected(prev => !prev);
    setIsSellSelected(false);
  };

  const handleSelectSell = () => {
    setIsAuctionSelected(false);
    setIsSellSelected(prev => !prev);
  };

  const handleSellNFT = async () => {
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    await (await marketplaceContract.makeItem(nftContract.address, tokenId, listingPrice)).wait();
    dispatch(loadNFT());
  };

  const handleBuy = async () => {
    await (await marketplaceContract.purchaseItem(itemId, { value: ethers.utils.parseEther(formattedPrice) })).wait();
    dispatch(loadNFT());
  };

  const handleCancel = async () => {
    await (await marketplaceContract.cancelOffered(itemId)).wait();
    dispatch(loadNFT());
  };

  if (!userId) {
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
          <button type="button" className="sell-button buy" onClick={isSeller ? handleCancel : handleBuy}>
            {isSeller ? 'Cancel' : 'Buy'}
          </button>
        </div>
      )}
    </ScSaleButton>
  );
};

export default SaleButton;
