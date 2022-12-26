/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEthereum } from 'react-icons/fa';
import Modal from '../Modal';

const ScNFTDetailImage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid rgba(35, 37, 42, 0.3);
  overflow: hidden;
  width: 100%;
  margin-bottom: 20px;

  .nft-detail-image {
    cursor: pointer;
    width: 100%;
    &-icon {
      padding: 12px;
      height: 42px;
      width: 100%;
    }
  }
`;
// TODO: Add redux
const NFTDetailImage = ({ item }) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenImage = () => {
    setShowModal(true);
  };

  return (
    <ScNFTDetailImage>
      <div className="nft-detail-image-icon">
        <FaEthereum />
      </div>
      {item.url && <img className="nft-detail-image" src={item.url} alt="nftImage" onClick={handleOpenImage} />}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <img src={item.url} alt="nftImage" onClick={handleOpenImage} />
        </Modal>
      )}
    </ScNFTDetailImage>
  );
};

export default NFTDetailImage;
