import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { getFormattedPrice, getItemId, getMarketplaceContract, getNFTOwner, getNFTSeller, getTokenId, getUserId } from '../../store/selectors';
import { loadNFT, setActiveModal } from '../../store/uiSlice';
import Button from '../Button';
import { MODAL_TYPES } from '../../constants';

const ScSaleButton = styled.div`
  .sell-buttons {
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
  }
  .sell-button {
    width: 30%;
    margin-right: 10px;
    font-size: 24px;
    @media screen and (max-width: 768px) {
      width: 100%;
      margin: 0;
    }
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
  const marketplaceContract = useSelector(getMarketplaceContract);

  const isOwner = owner && userId && owner.toLowerCase() === userId.toLowerCase();
  const isSeller = seller && userId && seller.toLowerCase() === userId.toLowerCase();

  const handleBuy = async () => {
    await (await marketplaceContract.purchaseItem(itemId, { value: ethers.utils.parseEther(formattedPrice) })).wait();
    dispatch(loadNFT());
  };

  if (!userId) {
    return null;
  }

  const handleCancel = async () => {
    await (await marketplaceContract.cancelOffered(itemId)).wait();
    dispatch(loadNFT());
  };

  return (
    <ScSaleButton>
      {isOwner && (
        <div className="sell-buttons">
          <Button className="sell-button" onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.SELL, props: { tokenId } }))}>
            Sell Item
          </Button>
        </div>
      )}
      {!isOwner && (
        <div className="item">
          <p className="text1">{formattedPrice} ETH</p>
          {isSeller && (
            <Button className="sell-button buy" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          {!isSeller && (
            <Button className="sell-button buy" onClick={handleBuy}>
              Buy
            </Button>
          )}
        </div>
      )}
    </ScSaleButton>
  );
};

export default SaleButton;
