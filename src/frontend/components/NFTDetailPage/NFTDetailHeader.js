import React from 'react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getUserID } from '../../store/selectors';
import AddressDisplay from '../AddressDisplay';
import ShareDropdown from './ShareDropdown';
import './ShareDropdown.css';

const ScNFTDetailHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;

  @media screen and (max-width: 768px) {
    padding: 0;
  }

  .nft-header-name {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 20px;
    padding: 0 20px;
    &-nftName {
      margin-bottom: 5px;
      height: 100%;
      width: 100%;
      font-size: 48px;
      font-weight: 600;
      word-wrap: break-word;

      @media screen and (max-width: 768px) {
        font-size: 36px;
      }
    }
    &-owner {
      width: 100%;
      &-id {
        max-width: 100%;
      }
    }
  }

  .sell-button {
    width: 30%;
    @media screen and (max-width: 768px) {
      width: 100%;
    }
    margin-right: 10px;
    font-size: 24px;
    background: var(--blue);
    color: #fff;
    border: 0;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
  }
`;

// TODO: Add redux
const NFTDetailHeader = ({ item, owner }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userID = useSelector(getUserID);

  const handleGoToSellPage = () => {
    navigate(`${location.pathname}/sell`);
  };

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <header className="nft-header-name-nftName" title={item.name}>
          {item.name} <ShareDropdown url={item.url} title="Check this NFT! " />
        </header>

        {userID !== owner && (
          <div className="nft-header-name-owner">
            <AddressDisplay address={owner} label="Owned By" className="nft-header-name-owner-id" />
          </div>
        )}
      </div>
      {owner === userID && (
        <button type="button" className="sell-button" onClick={handleGoToSellPage}>
          Sell Item
        </button>
      )}
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
