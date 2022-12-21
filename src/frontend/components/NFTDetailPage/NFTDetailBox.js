import React, { useState } from 'react';
import { TiArrowSortedUp, TiArrowSortedDown } from 'react-icons/ti';
import { useSelector } from 'react-redux';
import { getNFTContract } from '../../store/selectors';
import './NFTDetailBox.css';

// TODO: Add redux
const NFTDetailBox = ({ item }) => {
  const [description, setDescription] = useState(false);
  const [details, setDetails] = useState(false);

  const nftContract = useSelector(getNFTContract);

  const openDescription = () => {
    setDescription(!description);
  };

  const openDetails = () => {
    setDetails(!details);
  };

  /* eslint-disable no-underscore-dangle */
  return (
    <section className="nft-detail-box-container">
      <div>
        <div className="box-container">
          <div className="box-panel">
            <button type="button" className="box-button" onClick={openDescription}>
              <span>Description</span>
              <div className="up-down-icon">{description ? <TiArrowSortedUp /> : <TiArrowSortedDown />}</div>
            </button>
            {description && item.description && (
              <div className="button-body">
                <span>{item.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="box-container">
          <div className="box-panel">
            <button type="button" className="box-button" onClick={openDetails}>
              <span>Details</span>
              <div className="up-down-icon">{details ? <TiArrowSortedUp /> : <TiArrowSortedDown />}</div>
            </button>
            {details && (
              <div className="button-body">
                <div className="detail-span">
                  Contract Address
                  <span> {nftContract.address} </span>
                </div>
                <div className="detail-span">
                  Token ID
                  <span> {parseInt(item.tokenId._hex, 16)} </span>
                </div>
                <div className="detail-span">
                  Token Standard
                  <span> ERC-721 </span>
                </div>
                <div className="detail-span">
                  Chain
                  <span> Ethereum </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NFTDetailBox;
