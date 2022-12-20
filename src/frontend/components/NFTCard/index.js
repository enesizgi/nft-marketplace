import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import ScNFTCard from './ScNFTCard';
import { getMarketplaceContract, getNFTContract, getUserID } from '../../store/selectors';

const NFTCard = ({ item, loadItems, selectedTab }) => {
  const userID = useSelector(getUserID);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  // eslint-disable-next-line no-unused-vars
  const [sellPrice, setSellPrice] = useState(null);
  const [showSellButton, setShowSellButton] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const buyMarketItem = async itemToBuy => {
    await (await marketplaceContract.purchaseItem(itemToBuy.itemId, { value: itemToBuy.totalPrice })).wait();
    loadItems();
  };

  const sellMarketItem = async () => {
    const isApproved = await nftContract.isApprovedForAll(userID, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    await (await marketplaceContract.makeItem(nftContract.address, item.tokenId, listingPrice)).wait();
    loadItems();
  };

  const formattedPrice = item.totalPrice && `${ethers.utils.formatEther(item.totalPrice)} ETH`;

  const inProfilePage = location.pathname.includes('/user');

  const profileID = inProfilePage && location.pathname.split('/')[2];

  const handleHoverCard = () => {
    if (selectedTab !== 'Listed') {
      if (inProfilePage && profileID === userID) {
        setShowSellButton(true);
      } else {
        setShowBuyButton(true);
      }
    }
  };

  const handleHoverLeave = () => {
    setShowSellButton(false);
    setShowBuyButton(false);
  };

  const handleGoToProfile = e => {
    e.stopPropagation();
    navigate(`/user/${item.seller}`);
  };
  // TODO @Bugra: add onclick event for detail page
  // eslint-disable-next-line no-unused-vars
  const handleGoToDetailPage = () => {
    navigate(`/nft/${item.cid}`, { state: { id: item.itemId } });
  };

  const handleBuyButtonClicked = e => {
    e.stopPropagation();
    buyMarketItem(item);
  };

  return (
    <ScNFTCard onMouseEnter={handleHoverCard} onMouseLeave={handleHoverLeave} onClick={handleGoToDetailPage}>
      {item.url && (
        <div className="nft-image">
          <img src={item.url} alt="nftImage" />
        </div>
      )}
      <div className="nft-info">
        <div className="nft-info-name">
          <span className="nft-info-name-itemName">{item.name}</span>
          {!inProfilePage && (
            <button type="button" className="nft-info-name-seller" onClick={handleGoToProfile}>
              Seller: {item.seller}
            </button>
          )}
        </div>
        <div className="nft-info-price">
          {!showBuyButton && !showSellButton && <div className="nft-info-price-text">{formattedPrice}</div>}
          {showBuyButton && (
            <button type="button" className="nft-info-price-buy" onClick={handleBuyButtonClicked}>
              Buy for {formattedPrice}
            </button>
          )}
          {showSellButton && (
            <>
              {/* <input type="number" placeholder="Price in ETH" onChange={e => setSellPrice(e.target.value)} /> */}
              <button type="button" className="nft-info-price-sell" onClick={() => sellMarketItem(item)}>
                Sell Now
              </button>
            </>
          )}
        </div>
      </div>
    </ScNFTCard>
  );
};

export default NFTCard;
