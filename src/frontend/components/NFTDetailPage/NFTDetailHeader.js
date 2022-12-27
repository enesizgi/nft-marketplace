import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getUserID } from '../../store/selectors';
import AddressDisplay from '../AddressDisplay';
import ShareDropdown from './ShareDropdown';
import './ShareDropdown.css';
import NewTab from './NFTOpenNewTab';
import { compare } from '../../utils';

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
`;

// TODO: Add redux
const NFTDetailHeader = ({ item, owner }) => {
  const userID = useSelector(getUserID);
  const isOwnerPage = compare(owner, userID) || compare(item.seller, userID);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <header className="nft-header-name-nftName" title={item.name}>
          {item.name}
          <NewTab url={item.url} />
          <ShareDropdown url={item.url} title="Check this NFT! " />
        </header>

        {!isOwnerPage && (
          <div className="nft-header-name-owner">
            <AddressDisplay address={owner} label="Owned By" className="nft-header-name-owner-id" />
          </div>
        )}
      </div>
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
