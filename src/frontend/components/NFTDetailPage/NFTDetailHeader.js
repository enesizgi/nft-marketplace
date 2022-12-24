import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getDeviceType, getUserID } from '../../store/selectors';
import AddressDisplay from '../AddressDisplay';
import { DEVICE_TYPES } from '../../constants';

const ScNFTDetailHeader = styled.div`
  margin-bottom: 20px;
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;

  @media screen and (max-width: 768px) {
    padding: 0;
    flex-direction: column;
  }

  .nft-header-name {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 20px;
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
    width: 100%;
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
  const userID = useSelector(getUserID);
  const deviceType = useSelector(getDeviceType);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <header className="nft-header-name-nftName" title={item.name}>
          {item.name}
        </header>
        {userID !== owner && (
          <div className="nft-header-name-owner">
            <AddressDisplay address={owner} label="Owned By" className="nft-header-name-owner-id" />
          </div>
        )}
      </div>
      {deviceType === DEVICE_TYPES.MOBILE && owner === userID && (
        <button type="button" className="sell-button">
          Sell Item
        </button>
      )}
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
