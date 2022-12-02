import React from 'react';
import {ethers} from "ethers";

const NFTCard = ({ item, marketplace, loadMarketplaceItems }) => {
  const buyMarketItem = async itemToBuy => {
    await (await marketplace.purchaseItem(itemToBuy.itemId, { value: itemToBuy.totalPrice })).wait();
    loadMarketplaceItems();
  };

  return (
    <div className="imageItem">
      {item.image && <img src={`data:${item.image.data.mimetype};base64,${item.image.data.data}`} width="300px" alt="nftImage" />}
      <div className="imageItemInfo">
        <div className="imageItemName">
          Name:
          {item.name}
        </div>
        <div className="imageItemDescription">
          Description:
          {item.description}
        </div>
        <button type="button" onClick={() => buyMarketItem(item)}>
          Buy for
          {ethers.utils.formatEther(item.totalPrice)}
          {' '}
          ETH
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
