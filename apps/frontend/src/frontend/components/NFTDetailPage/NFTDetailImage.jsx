/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaEthereum } from 'react-icons/fa';
import { theme, MODAL_TYPES } from '../../constants';
import { getNFTURL } from '../../store/selectors';
import { setActiveModal } from '../../store/uiSlice';

const ScNFTDetailImage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid ${theme.secondaryBlue};
  overflow: hidden;
  width: 100%;
  margin-bottom: 20px;

  .nft-detail-image {
    cursor: pointer;
    width: 100%;
    &-icon {
      color: #fff;
      padding: 12px;
      height: 42px;
      width: 100%;
    }
  }
`;

const NFTDetailImage = () => {
  const url = useSelector(getNFTURL);
  const dispatch = useDispatch();

  const handleOpenImage = () => {
    dispatch(setActiveModal({ type: MODAL_TYPES.IMAGE_PREVIEW, props: { src: url } }));
  };

  return (
    <ScNFTDetailImage>
      <div className="nft-detail-image-icon">
        <FaEthereum />
      </div>
      {url && <img className="nft-detail-image" src={url} alt="nftImage" onClick={handleOpenImage} />}
    </ScNFTDetailImage>
  );
};

export default NFTDetailImage;
