import React, { useRef, useEffect } from 'react';
import { TfiArrowCircleLeft, TfiArrowCircleRight } from 'react-icons/tfi';
import { useSwipe } from 'use-swipe-hook';
import NFTShowcase from '../NFTShowcase';

const NFTSlider = ({ itemCount, selectedTab, currentPage, setCurrentPage, loading, items, onePageNftCount }) => {
  const nftSliderRef = useRef();
  const swipeDirection = useSwipe({ ref: nftSliderRef, thresholdPX: 5 });
  const placeHolderItems = [{}, {}, {}, {}, {}];
  const pages = [...Array(Math.ceil(itemCount / onePageNftCount) + 1).keys()].slice(1);
  const onRightHandler = () => setCurrentPage(prev => Math.min(Math.ceil(itemCount / onePageNftCount), prev + 1));
  const onLeftHandler = () => setCurrentPage(prev => Math.max(1, prev - 1));

  useEffect(() => {
    if (swipeDirection === 'left') onRightHandler();
    if (swipeDirection === 'right') onLeftHandler();
  }, [swipeDirection]);

  if (itemCount === 0) return null;

  return (
    <div className="nft-slider-container" ref={nftSliderRef}>
      <div className="nft-slider">
        <TfiArrowCircleLeft onClick={loading ? () => {} : onLeftHandler} />
        <NFTShowcase NFTs={loading ? placeHolderItems : items} selectedTab={selectedTab} loading={loading} />
        <TfiArrowCircleRight onClick={loading ? () => {} : onRightHandler} />
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
