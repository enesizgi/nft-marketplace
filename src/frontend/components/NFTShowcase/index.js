import React from 'react';
import styled from 'styled-components';
import NFTCard from '../NFTCard';

const ScNFTShowcase = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 350px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const NFTShowcase = ({ NFTs, loadItems }) => (
  <ScNFTShowcase>
    {NFTs.map(item => (
      <NFTCard key={`${item.url}-${Math.random()}`} item={item} loadItems={loadItems} />
    ))}
  </ScNFTShowcase>
);

export default NFTShowcase;
