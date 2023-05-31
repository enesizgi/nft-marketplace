import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Button } from '@chakra-ui/react';
import NFTCard from '../NFTCard';
import { getButtonSize } from '../../store/selectors';

const ScNFTShowcase = styled.div`
  width: 100%;
  .nftCard-container {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    @media screen and (max-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media screen and (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media screen and (max-width: 450px) {
      grid-template-columns: repeat(1, 1fr);
    }
  }
  .emptyShowcase {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    &-text {
      margin-bottom: 20px;
      text-align: center;
      font-size: 24px;
      @media screen and (max-width: 768px) {
        font-size: 18px;
      }
      @media screen and (max-width: 480px) {
        font-size: 16px;
      }
    }
  }
`;

const NFTShowcase = ({ NFTs, selectedTab, loading }) => {
  const buttonSize = useSelector(getButtonSize);
  const navigate = useNavigate();
  return (
    <ScNFTShowcase>
      {NFTs.length ? (
        <div className="nftCard-container">
          {NFTs.map(item => (
            <NFTCard key={`${item.url}-${Math.random()}`} item={item} selectedTab={selectedTab} loading={loading} />
          ))}
        </div>
      ) : (
        <div className="emptyShowcase">
          <p className="emptyShowcase-text">Nothing to show here</p>
          <Button onClick={() => navigate('/')} size={buttonSize} colorScheme="linkedin" className="emptyShocase-button">
            Start Shopping
          </Button>
        </div>
      )}
    </ScNFTShowcase>
  );
};

export default NFTShowcase;
