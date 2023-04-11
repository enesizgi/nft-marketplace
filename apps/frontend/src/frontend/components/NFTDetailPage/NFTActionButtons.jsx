import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import {
  getButtonSize,
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
  const marketplaceContract = useSelector(getMarketplaceContract);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const buttonSize = useSelector(getButtonSize);
  const formattedPrice = useSelector(getFormattedPrice);
  const cid = useSelector(getNFTCid);
  const isInCart = useSelector(getIsInCart(cid));

  const isOwner = owner && userId && owner.toLowerCase() === userId.toLowerCase();
  const isSeller = seller && userId && seller.toLowerCase() === userId.toLowerCase();

  const handleBuy = async () => {
    await (await marketplaceContract.purchaseItem(itemId, { value: ethers.utils.parseEther(formattedPrice) })).wait();
    dispatch(loadNFT());
  };

  const handleUpdateCart = () => dispatch(updateCart(cid));

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
            <div className="buyer-actions">
              <Button className="cart-button" onClick={handleUpdateCart}>
                <CartIcon />
                {isInCart ? 'Remove From ' : 'Add To '} Cart
              </Button>
              <Button size={buttonSize} className="buy-button" colorScheme="linkedin" onClick={handleBuy}>
                Buy Item
              </Button>
              {(isListed || isOnAuction) && (
                <Button
                  size={buttonSize}
                  colorScheme="linkedin"
                  onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.OFFER, props: { tokenId } }))}
                >
                  Make Offer
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </ScNFTActionButtons>
  );
};

export default NFTActionButtons;
