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
  getNFTOwner,
  getNFTSeller,
  getTimeToEnd,
  getTokenId,
  getUserId
} from '../../store/selectors';
import { loadNFT, setActiveModal } from '../../store/uiSlice';
import Button from '../Button';
import { ReactComponent as CartIcon } from '../../assets/cart-icon.svg';
import { ReactComponent as OfferIcon } from '../../assets/offer-icon.svg';
import { MODAL_TYPES } from '../../constants';
import { updateCart } from '../../store/actionCreators';
import { classNames, compare } from '../../utils';
import API from '../../modules/api';
import { checkUserRejectedHandler, dispatchToastHandler, waitConfirmHandler, waitTransactionHandler } from '../utils';

const ScNFTActionButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  button {
    max-width: 450px;
    margin-bottom: 20px;
    width: calc(50% - 40px);
    margin-right: 20px;
    padding: 5px 20px;
    @media screen and (max-width: 600px) {
      width: 100%;
      margin-right: 0;
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
  const isInCart = useSelector(getIsInCart(tokenId));
  const chainId = useSelector(getChainId);
  const timeToEnd = useSelector(getTimeToEnd);

  const now = Math.floor(new Date().getTime() / 1000);
  const isAuctionOver = now > timeToEnd;

  const isOwner = seller ? compare(seller, userId) : compare(owner, userId);

  const dispatchToast = dispatchToastHandler(dispatch);
  const checkForUserRejectedError = checkUserRejectedHandler(dispatchToast);
  const waitForTransaction = waitTransactionHandler(null, dispatchToast);

  const handleBuy = async () => {
    const waitForConfirm = waitConfirmHandler(
      async () => marketplaceContract.purchaseItem(itemId, { value: ethers.utils.parseEther(formattedPrice) }),
      checkForUserRejectedError
    );
    const transaction = await waitForConfirm();
    if (transaction != null) await waitForTransaction(transaction);
    await API.syncEvents({ chainId });
    dispatch(loadNFT());
  };

  const handleUpdateCart = () => dispatch(updateCart(tokenId));

  if (!userId) {
    return null;
  }

  const handleCancel = async () => {
    try {
      if (isListed) {
        const waitForConfirm = waitConfirmHandler(async () => marketplaceContract.cancelOffered(itemId), checkForUserRejectedError);
        const transaction = await waitForConfirm();
        if (transaction != null) await waitForTransaction(transaction);
      } else if (isOnAuction) {
        const waitForConfirm = waitConfirmHandler(async () => marketplaceContract.cancelAuction(auctionId), checkForUserRejectedError);
        const transaction = await waitForConfirm();
        if (transaction != null) await waitForTransaction(transaction);
      }
      await API.syncEvents({ chainId });
      if (isOnAuction) {
        await API.deleteBidsOfNft({ tokenId });
      }
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
      {isOwner && (isListed || (isOnAuction && !isAuctionOver)) && (
        <Button size={buttonSize} className={classNames({ cancel: isListed })} onClick={handleCancel}>
          Cancel {isListed ? 'Sale' : 'Auction'}
        </Button>
      )}
      {!isOwner && (isListed || isOnAuction) && (
        <div className="buyer-actions">
          {isListed && (
            <>
              <Button size={buttonSize} className="buy-button" colorScheme="linkedin" onClick={handleBuy}>
                Buy Item
              </Button>
              <Button className={classNames({ cancel: isInCart, outline: true })} onClick={handleUpdateCart}>
                <CartIcon />
                {isInCart ? 'Remove From ' : 'Add To '} Cart
              </Button>
            </>
          )}
          <Button className="outline" onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.OFFER, props: { tokenId } }))}>
            <OfferIcon />
            Make Offer
          </Button>
        </div>
      )}
    </ScNFTActionButtons>
  );
};

export default NFTActionButtons;
