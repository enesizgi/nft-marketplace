import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ScNFTCard from './ScNFTCard';

const NFTCard = ({ item, account, marketplace, nft, loadItems, isOwner }) => {
  // eslint-disable-next-line no-unused-vars
  const [sellPrice, setSellPrice] = useState(null);
  const [showSellButton, setShowSellButton] = useState(false);
  const [showBuyButton, setShowBuyButton] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const buyMarketItem = async itemToBuy => {
    await (await marketplace.purchaseItem(itemToBuy.itemId, { value: itemToBuy.totalPrice })).wait();
    loadItems();
  };

  const sellMarketItem = async () => {
    const isApproved = await nft.isApprovedForAll(account, marketplace.address);
    if (!isApproved) {
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    await (await marketplace.makeItem(nft.address, item.tokenId, listingPrice)).wait();
    loadItems();
  };

  const formattedPrice = item.totalPrice && `${ethers.utils.formatEther(item.totalPrice)} ETH`;

  const showSeller = !location.pathname.includes('/user');

  const handleHoverCard = useCallback(() => {
    if (isOwner) {
      setShowSellButton(true);
    } else {
      setShowBuyButton(true);
    }
  }, [isOwner]);

  const handleHoverLeave = useCallback(() => {
    setShowSellButton(false);
    setShowBuyButton(false);
  }, []);

  const handleGoToProfile = () => {
    navigate(`/user/${item.seller}`);
  };

  return (
    <ScNFTCard onMouseEnter={handleHoverCard} onMouseLeave={handleHoverLeave}>
      {item.url && (
        <div className="nft-image">
          <img src={item.url} alt="nftImage" />
        </div>
      )}
      <div className="nft-info">
        <div className="nft-info-name">
          <span className="nft-info-name-itemName">{item.name}</span>
          {showSeller && (
            <button type="button" className="nft-info-name-seller" onClick={handleGoToProfile}>
              Seller: {item.seller}
            </button>
          )}
        </div>
        <div className="nft-info-price">
          {!showBuyButton && !showSellButton && <div className="nft-info-price-text">{formattedPrice}</div>}
          {showBuyButton && (
            <button type="button" className="nft-info-price-buy" onClick={() => buyMarketItem(item)}>
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
