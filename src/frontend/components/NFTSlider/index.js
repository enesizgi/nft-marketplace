import React from 'react';
import { TfiArrowCircleLeft, TfiArrowCircleRight } from 'react-icons/tfi';
import NFTShowcase from '../NFTShowcase';

const NFTSlider = ({ itemCount, loadItems, selectedTab, currentPage, setCurrentPage, loading, items }) => {
  const placeHolderItems = [{}, {}, {}, {}, {}];
  const pages = [...Array(Math.ceil(itemCount / 5) + 1).keys()].slice(1);
  if (itemCount === 0) {
    return null;
  }
  return (
    <div className="nft-slider-container">
      <div className="nft-slider">
        <TfiArrowCircleLeft onClick={loading ? () => {} : () => setCurrentPage(prev => Math.max(1, prev - 1))} />
        <NFTShowcase NFTs={loading ? placeHolderItems : items} loadItems={loadItems} selectedTab={selectedTab} loading={loading} />
        <TfiArrowCircleRight onClick={loading ? () => {} : () => setCurrentPage(prev => Math.min(Math.ceil(itemCount / 5), prev + 1))} />
      </div>
      <nav className="indicators">
        <ul>
          {pages.map(value => (
            <li key={value}>
              <button
                type="button"
                onClick={loading ? () => {} : () => setCurrentPage(value)}
                className={`${currentPage === value ? 'current' : ''}`}
                aria-label={`Page ${value}`}
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default NFTSlider;
