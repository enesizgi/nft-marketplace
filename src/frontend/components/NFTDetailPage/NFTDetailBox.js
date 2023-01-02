/* eslint-disable no-underscore-dangle */
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getNFTContract, getNFTDescription, getTokenID } from '../../store/selectors';
import DetailsDropdown from '../DetailsDropdown';

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
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
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
const NFTDetailBox = () => {
  const nftContract = useSelector(getNFTContract);
  const description = useSelector(getNFTDescription);
  const tokenID = useSelector(getTokenID);

  const NFTDetails = {
    'Contract Address': nftContract.address,
    'Token ID': tokenID,
    'Token Standard': 'ERC-721',
    Chain: 'Ethereum'
  };

  return (
    <ScNFTDetailBox>
      <DetailsDropdown title="Description">
        <div className="description-text">{description}</div>
      </DetailsDropdown>
      <DetailsDropdown title="Details">
        {Object.entries(NFTDetails).map(([detailName, detail]) => (
          <div className="details-container" key={detailName}>
            <span className="detail-name">{detailName}</span>
            <span className="detail-span">{detail}</span>
          </div>
        ))}
      </DetailsDropdown>
    </ScNFTDetailBox>
  );
};

export default NFTDetailBox;
