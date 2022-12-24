/* eslint-disable no-underscore-dangle */
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getNFTContract } from '../../store/selectors';
import DetailsDropdown from '../DetailsDropdown';
import AddressDisplay from '../AddressDisplay';

const ScNFTDetailBox = styled.div`
  .details-container {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    :hover {
      background: rgba(35, 37, 42, 0.1);
      transition: 0.2s ease;
    }
  }

  .detail-name {
    line-height: 100%;
    font-size: 16px;
    font-weight: 600;
    width: 40%;
    word-wrap: break-word;
  }
  .detail-span {
    line-height: 100%;
    width: 60%;
    text-align: end;
    vertical-align: middle;
    font-size: 16px;
  }

  .description-text {
    padding: 20px;
    font-size: 16px;
    word-wrap: break-word;
  }
`;

// TODO: Add redux
const NFTDetailBox = ({ item }) => {
  const nftContract = useSelector(getNFTContract);

  const NFTDetails = {
    'Contract Address': nftContract.address,
    'Token ID': parseInt(item.tokenId._hex, 16),
    'Token Standard': 'ERC-721',
    Chain: 'Ethereum'
  };

  return (
    <ScNFTDetailBox>
      <DetailsDropdown title="Description">
        <div className="description-text">{item.description}</div>
      </DetailsDropdown>
      <DetailsDropdown title="Details">
        {Object.entries(NFTDetails).map(([detailName, detail]) => (
          <div className="details-container">
            <span className="detail-name">{detailName}</span>
            {detailName === 'Contract Address' ? (
              <AddressDisplay className="detail-span" address={detail} />
            ) : (
              <span className="detail-span">{detail}</span>
            )}
          </div>
        ))}
      </DetailsDropdown>
    </ScNFTDetailBox>
  );
};

export default NFTDetailBox;
