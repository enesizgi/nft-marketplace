import React from 'react';
import { FaEthereum } from 'react-icons/fa';
import './NFTDetailImage.css';

// TODO: Add redux
const NFTDetailImage = ({ item }) => {
  const it = item;

  return (
    <section className="nft-detail-image-container">
      <header className="nft-detail-image-header">
        <div className="nft-icon">
          <FaEthereum />
        </div>
      </header>
      <div className="nft-detail-image">
        <div className="nft-detail-image-inner">
          <div className="nft-detail-image-inner-container">
            <div className="nft-detail-image-media">{it.url && <img className="nft-image" src={it.url} alt="NFT" />}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NFTDetailImage;
