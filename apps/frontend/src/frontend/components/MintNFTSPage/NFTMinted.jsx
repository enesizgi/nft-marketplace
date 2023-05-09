import React from 'react';
import styled from 'styled-components';
import { ReactComponent as CheckIcon } from '../../assets/check-icon.svg';
import { theme } from '../../constants';
import Button from '../Button';

const ScNFTMinted = styled.div`
  width: 70%;
  @media screen and (max-width: 768px) {
    width: 90%;
  }
  margin: 30px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  .check-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
    @media screen and (max-width: 768px) {
      width: 50px;
      height: 50px;
    }
    fill: ${theme.blue};
  }
  .success-message {
    text-align: center;
    margin-bottom: 20px;
  }
  font-size: 36px;
  @media screen and (max-width: 768px) {
    font-size: 24px;
  }
  .nftPreview {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 250px;
    height: 400px;
    margin-bottom: 50px;
    @media screen and (max-width: 768px) {
      width: 200px;
      height: 300px;
    }
    border-radius: 5%;
    box-shadow: 0 0 6px #fff;
    &:hover {
      box-shadow: 0 0 10px #fff;
    }
    .nftImage {
      width: 100%;
      height: 60%;
      overflow: hidden;
      > img {
        min-width: 100%;
        min-height: 100%;
        margin: auto;
      }
    }
    .nftText {
      height: 40%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 10px;
      font-weight: 600;
      .nftPrice {
        align-self: center;
      }
    }
  }

  .nftMinted-footer {
    display: flex;
    @media screen and (max-width: 480px) {
      flex-direction: column;
    }
    button {
      font-size: 24px;
      padding: 10px 20px;
      width: unset;
      height: unset;
      @media screen and (max-width: 768px) {
        font-size: 18px;
      }
    }
    .goToDetail {
      margin-right: 20px;
      @media screen and (max-width: 480px) {
        margin: 0 0 20px;
      }
    }
  }
`;

const NFTMinted = ({ price, image, name, onGoToDetails, reload }) => (
  <ScNFTMinted>
    <CheckIcon className="check-icon" />
    <p className="success-message">NFT is created successfully</p>
    <div className="nftPreview">
      <div className="nftImage">
        <img src={image} alt="nftImage" />
      </div>
      <div className="nftText">
        <p className="nftName">{name}</p>
        <p className="nftPrice">{price}</p>
      </div>
    </div>
    <div className="nftMinted-footer">
      <Button className="goToDetail" onClick={onGoToDetails}>
        Go to details
      </Button>
      <Button className="mintAnother" onClick={reload}>
        Mint another one
      </Button>
    </div>
  </ScNFTMinted>
);

export default NFTMinted;
