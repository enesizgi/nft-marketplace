import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import ScNFTCard from './ScNFTCard';
import { getNFTContract, getUserId } from '../../store/selectors';
import AddressDisplay from '../AddressDisplay';
import imagePlaceholder from '../../assets/image-placeholder.png';
import { MODAL_TYPES } from '../../constants';
import { setActiveModal } from '../../store/uiSlice';
import { compare, serializeBigNumber } from '../../utils';

const NFTCard = ({ item, selectedTab, loading }) => {
  const userId = useSelector(getUserId);
  const nftContract = useSelector(getNFTContract);

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

  const handleBuyButtonClicked = e => {
    e.stopPropagation();
    dispatch(setActiveModal({ type: MODAL_TYPES.BUY, props: { tokenId: serializeBigNumber(item.tokenId) } }));
  };

  const handleSellButtonClicked = e => {
    e.stopPropagation();
    dispatch(setActiveModal({ type: MODAL_TYPES.SELL, props: { tokenId: serializeBigNumber(item.tokenId) } }));
  };

  return (
    <ScNFTCard onMouseEnter={handleHoverCard} onMouseLeave={handleHoverLeave} onClick={handleGoToDetailPage}>
      <div className="nft-image">
        <img src={item.url ?? imagePlaceholder} alt="nftImage" className={`${!item.url && loading ? 'shimmer' : ''}`} />
      </div>
      <div className="nft-info">
        <div className="nft-info-name">
          <span className="nft-info-name-itemName">{item.name}</span>
          {!inProfilePage && <AddressDisplay className="nft-info-name-seller" address={item.seller} label="Seller" />}
        </div>
        <div className="nft-info-price">
          {!showBuyButton && !showSellButton && <div className="nft-info-price-text">{formattedPrice}</div>}
          {showBuyButton && (
            <button type="button" className="nft-info-price-buy" onClick={handleBuyButtonClicked}>
              Buy for {formattedPrice}
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
