import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import {
  getButtonSize,
  getFormattedPrice,
  getIsListed,
  getIsOnAuction,
  getItemId,
  getMarketplaceContract,
  getNFTOwner,
  getNFTSeller,
  getTokenId,
  getUserId
} from '../../store/selectors';
import { loadNFT, setActiveModal } from '../../store/uiSlice';
import Button from '../Button';
import { MODAL_TYPES } from '../../constants';

const ScNFTActionButtons = styled.div`
  margin: 10px 0;
  display: flex;
  align-items: center;
  & > button {
    margin-right: 10px;
    padding: 5px 30px;
  }
`;

const NFTActionButtons = () => {
  const dispatch = useDispatch();
  const owner = useSelector(getNFTOwner);
  const userId = useSelector(getUserId);
  const seller = useSelector(getNFTSeller);
  const tokenId = useSelector(getTokenId);
  const itemId = useSelector(getItemId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const buttonSize = useSelector(getButtonSize);
  const formattedPrice = useSelector(getFormattedPrice);

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
    <ScNFTActionButtons>
      {isOwner && (
        <Button colorScheme="linkedin" size={buttonSize} onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.SELL, props: { tokenId } }))}>
          Sell Item
        </Button>
      )}
      {!isOwner && (
        <>
          {isSeller && (
            <Button size={buttonSize} colorScheme="linkedin" onClick={handleCancel}>
              Cancel Sale
            </Button>
          )}
          {!isSeller && (
            <Button size={buttonSize} colorScheme="linkedin" onClick={handleBuy}>
              Buy Item
            </Button>
          )}
          {!isSeller && (isListed || isOnAuction) && (
            <Button
              size={buttonSize}
              colorScheme="linkedin"
              onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.OFFER, props: { tokenId } }))}
            >
              Make Offer
            </Button>
          )}
        </>
      )}
    </ScNFTActionButtons>
  );
};

export default NFTActionButtons;
