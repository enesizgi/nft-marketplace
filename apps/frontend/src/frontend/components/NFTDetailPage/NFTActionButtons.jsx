import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import {
  getAuctionId,
  getButtonSize,
  getChainId,
  getFormattedPrice,
  getIsInCart,
  getIsListed,
  getIsOnAuction,
  getItemId,
  getMarketplaceContract,
  getNFTCid,
  getNFTOwner,
  getNFTSeller,
  getTokenId,
  getUserId
} from '../../store/selectors';
import { loadNFT, setActiveModal } from '../../store/uiSlice';
import Button from '../Button';
import { ReactComponent as CartIcon } from '../../assets/cart-icon.svg';
import { MODAL_TYPES } from '../../constants';
import { updateCart } from '../../store/actionCreators';
import { compare } from '../../utils';
import API from '../../modules/api';

const ScNFTActionButtons = styled.div`
  margin: 10px 0;
  width: 100%;
  display: flex;
  align-items: center;
  button {
    max-width: 350px;
    margin-bottom: 20px;
    width: calc(50% - 40px);
    margin-right: 20px;
    padding: 5px 30px;
    &.buy-button {
      margin-right: 0;
    }
    @media screen and (max-width: 600px) {
      width: 100%;
      &.buy-button {
        margin-right: 20px;
      }
    }
  }
  .buyer-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
`;

const NFTActionButtons = () => {
  const dispatch = useDispatch();
  const owner = useSelector(getNFTOwner);
  const userId = useSelector(getUserId);
  const seller = useSelector(getNFTSeller);
  const tokenId = useSelector(getTokenId);
  const itemId = useSelector(getItemId);
  const auctionId = useSelector(getAuctionId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const buttonSize = useSelector(getButtonSize);
  const formattedPrice = useSelector(getFormattedPrice);
  const cid = useSelector(getNFTCid);
  const isInCart = useSelector(getIsInCart(cid));
  const chainId = useSelector(getChainId);

  const isOwner = seller ? compare(seller, userId) : compare(owner, userId);

  const handleBuy = async () => {
    await (await marketplaceContract.purchaseItem(itemId, { value: ethers.utils.parseEther(formattedPrice) })).wait();
    await API.syncEvents({ chainId });
    dispatch(loadNFT());
  };

  const handleUpdateCart = () => dispatch(updateCart(cid));

  if (!userId) {
    return null;
  }

  const handleCancel = async () => {
    try {
      if (isListed) {
        await (await marketplaceContract.cancelOffered(itemId)).wait();
      } else if (isOnAuction) {
        await (await marketplaceContract.cancelAuction(auctionId)).wait();
      }
      await API.syncEvents({ chainId });
    } catch (error) {
      console.log(error);
    }
    dispatch(loadNFT());
  };

  return (
    <ScNFTActionButtons>
      {isOwner && !isListed && !isOnAuction && (
        <Button colorScheme="linkedin" size={buttonSize} onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.SELL, props: { tokenId } }))}>
          Sell Item
        </Button>
      )}
      {isOwner && (isListed || isOnAuction) && (
        <Button size={buttonSize} colorScheme="linkedin" onClick={handleCancel}>
          Cancel {isListed ? 'Sale' : 'Auction'}
        </Button>
      )}
      {!isOwner && (isListed || isOnAuction) && (
        <div className="buyer-actions">
          {isListed && (
            <>
              <Button className="cart-button" onClick={handleUpdateCart}>
                <CartIcon />
                {isInCart ? 'Remove From ' : 'Add To '} Cart
              </Button>
              <Button size={buttonSize} className="buy-button" colorScheme="linkedin" onClick={handleBuy}>
                Buy Item
              </Button>
            </>
          )}
          <Button size={buttonSize} colorScheme="linkedin" onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.OFFER, props: { tokenId } }))}>
            Make Offer
          </Button>
        </div>
      )}
    </ScNFTActionButtons>
  );
};

export default NFTActionButtons;
