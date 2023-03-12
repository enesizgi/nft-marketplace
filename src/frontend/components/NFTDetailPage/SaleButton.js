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
import { loadNFT } from '../../store/uiSlice';
import SellModal from './SellModal';
import Button from '../Button';

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

  const [showSellModal, setShowSellModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isOwner = owner && userId && owner.toLowerCase() === userId.toLowerCase();
  const isSeller = seller && userId && seller.toLowerCase() === userId.toLowerCase();

  const handleSellNFT = async sellPrice => {
    setIsLoading(true);
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    await (await marketplaceContract.makeItem(nftContract.address, tokenId, listingPrice)).wait();
    setIsLoading(false);
    setShowSellModal(false);
    dispatch(loadNFT());
  };

  const handleStartAuction = async (expireTime, minimumBid) => {
    setIsLoading(true);
    if (!expireTime || !minimumBid) return;
    const minimumBidPrice = ethers.utils.parseEther(minimumBid.toString());
    const untilDate = Math.floor(new Date(expireTime).getTime() / 1000);
    if (untilDate < Math.floor(Date.now() / 1000)) return;
    // approve marketplace to spend nft
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    await (await marketplaceContract.startAuction(nftContract.address, tokenId, minimumBidPrice, untilDate)).wait();
    setIsLoading(false);
    setShowSellModal(false);
    dispatch(loadNFT());
  };

  const handleBuy = async () => {
    await (await marketplaceContract.purchaseItem(itemId, { value: ethers.utils.parseEther(formattedPrice) })).wait();
    dispatch(loadNFT());
  };

  if (!userId) {
    return null;
  }

  return (
    <ScSaleButton>
      {isOwner && (
        <div className="sell-buttons">
          <Button className="sell-button" onClick={() => setShowSellModal(true)}>
            Sell Item
          </Button>
        </div>
      )}
      {!isOwner && (
        <div className="item">
          <div className="text1">{formattedPrice} ETH</div>
          <Button className="sell-button buy" onClick={handleBuy}>
            {isSeller ? 'Cancel' : 'Buy'}
          </Button>
        </div>
      )}
      {showSellModal && (
        <SellModal isLoading={isLoading} setShowSellModal={setShowSellModal} handleSellNFT={handleSellNFT} handleStartAuction={handleStartAuction} />
      )}
    </ScSaleButton>
  );
};

export default SaleButton;
