import React from 'react';
import './NFTDetailHeader.css';

// TODO: Add redux
const NFTDetailHeader = ({ item, owner }) => {
  const it = item;
  return (
    <section className="nft-header-container">
      <div className="nft-header-name-container">
        <header className="nft-header-name" title={item.name}>
          {it.name}
        </header>
      </div>
      <div className="nft-header-owner-container">
        <div className="nft-header-owner">
          Owned by &nbsp;
          <span>{owner}</span>
        </div>
      </div>
    </section>
  );
};

export default NFTDetailHeader;
