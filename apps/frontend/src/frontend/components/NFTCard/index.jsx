import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import ScNFTCard from './ScNFTCard';
import { getIsInCart, getIsInFavorites, getNFTContract, getUserId } from '../../store/selectors';
import AddressDisplay from '../AddressDisplay';
import { ReactComponent as ImagePlaceholder } from '../../assets/image-placeholder.svg';
import { ReactComponent as CartIcon } from '../../assets/cart-icon.svg';
import { ReactComponent as FavoriteIcon } from '../../assets/heart-icon.svg';
import { MODAL_TYPES } from '../../constants';
import { setActiveModal } from '../../store/uiSlice';
import { classNames, compare, serializeBigNumber } from '../../utils';
import { updateCart, updateFavorites } from '../../store/actionCreators';

const NFTCard = ({ item, selectedTab, loading }) => {
  const userId = useSelector(getUserId);
  const nftContract = useSelector(getNFTContract);
  const isInCart = useSelector(getIsInCart(item?.cid));
  const isInFavorites = useSelector(getIsInFavorites(item?.cid));

  const [showSellButton, setShowSellButton] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const formattedPrice = item.totalPrice && `${ethers.utils.formatEther(item.totalPrice)} ETH`;

  const inProfilePage = location.pathname.includes('/user');

  const profileId = inProfilePage && location.pathname.split('/')[2];

  const handleHoverCard = () => {
    switch (selectedTab) {
      case 'Listed':
        if (!compare(profileId, userId) && item.auctionId === undefined) {
          setShowBuyButton(true);
        }
        break;
      case 'Purchased':
        if (compare(profileId, userId)) setShowSellButton(true);
        break;
      case 'Owned':
        if (compare(profileId, userId)) setShowSellButton(true);
        break;
      case 'Home':
        if (!compare(item.seller, userId) && item.auctionId === undefined) setShowBuyButton(true);
        break;
      default:
        break;
    }
  };

  const handleHoverLeave = () => {
    setShowSellButton(false);
    setShowBuyButton(false);
  };
  // TODO @Bugra: add onclick event for detail page
  // eslint-disable-next-line no-unused-vars
  const handleGoToDetailPage = () => {
    navigate(`/nft/${nftContract.address}/${item.tokenId}`, { state: { item } });
  };

  const handleAddToCart = e => {
    e.stopPropagation();
    if (!isInCart) {
      dispatch(updateCart(item.cid));
    } else {
      navigate('/cart');
    }
  };

  const handleUpdateFavorites = e => {
    e.stopPropagation();
    dispatch(updateFavorites(item.cid));
  };

  const handleSellButtonClicked = e => {
    e.stopPropagation();
    dispatch(setActiveModal({ type: MODAL_TYPES.SELL, props: { tokenId: serializeBigNumber(item.tokenId) } }));
  };

  return (
    <ScNFTCard onMouseEnter={handleHoverCard} onMouseLeave={handleHoverLeave} onClick={handleGoToDetailPage}>
      <button type="button" onClick={handleUpdateFavorites} className={classNames({ 'favorite-icon': true, isFavorite: isInFavorites })}>
        <FavoriteIcon />
      </button>
      <div className="nft-image">{item.url && !loading ? <img src={item.url} alt="nftImage" /> : <ImagePlaceholder className="shimmer" />}</div>
      <div className="nft-info">
        <div className="nft-info-name">
          <span className="nft-info-name-itemName">{item.name}</span>
          {!inProfilePage && !loading && <AddressDisplay className="nft-info-name-seller" address={item.seller} label="Seller" />}
        </div>
        <div className="nft-info-price">
          {!showBuyButton && !showSellButton && <div className="nft-info-price-text">{formattedPrice}</div>}
          {showBuyButton && (
            <button type="button" className="nft-info-price-buy" onClick={handleAddToCart}>
              {isInCart ? (
                <>
                  <CartIcon />
                  <p>In Cart</p>
                </>
              ) : (
                <p>Add To Cart</p>
              )}
            </button>
          )}
          {showSellButton && (
            <button type="button" className="nft-info-price-sell" onClick={handleSellButtonClicked}>
              Sell Now
            </button>
          )}
        </div>
      </div>
    </ScNFTCard>
  );
};

export default NFTCard;
