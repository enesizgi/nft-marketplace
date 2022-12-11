import React, { useState } from 'react';
import { ethers } from 'ethers';

const NFTCard = ({ item, account, marketplace, nft, loadMarketplaceItems, showBuyButton, showSellButton }) => {
  const [sellPrice, setSellPrice] = useState(null);
  const buyMarketItem = async itemToBuy => {
    await (await marketplace.purchaseItem(itemToBuy.itemId, { value: itemToBuy.totalPrice })).wait();
    loadMarketplaceItems();
  };

  const sellMarketItem = async () => {
    const isApproved = await nft.isApprovedForAll(account, marketplace.address);
    if (!isApproved) {
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    await (await marketplace.makeItem(nft.address, item.tokenId, listingPrice)).wait();
    loadMarketplaceItems();
  };

  return (
    <div className="imageItem">
      {item.url && <img src={item.url} width="300px" alt="nftImage" />}
      <div className="imageItemInfo">
        <div className="imageItemName">
          Name:
          {item.name}
        </div>
        <div className="imageItemDescription">
          Description:
          {item.description}
        </div>
        {item.totalPrice && (
          <div className="imageItemPrice">
            Price:
            {ethers.utils.formatEther(item.totalPrice)} ETH
          </div>
        )}
        {showBuyButton && (
          <button type="button" onClick={() => buyMarketItem(item)}>
            Buy Now
          </button>
        )}
        {showSellButton && (
          <>
            <input type="number" placeholder="Price in ETH" onChange={e => setSellPrice(e.target.value)} />
            <button type="button" onClick={() => sellMarketItem(item)}>
              Sell Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
