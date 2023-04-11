/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaEthereum } from 'react-icons/fa';
import { theme, MODAL_TYPES } from '../../constants';
import { getIsInFavorites, getNFTCid, getNFTURL } from '../../store/selectors';
import { setActiveModal } from '../../store/uiSlice';
import { ReactComponent as FavoriteIcon } from '../../assets/heart-icon.svg';
import { classNames } from '../../utils';
import { updateFavorites } from '../../store/actionCreators';

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
    &-icons {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      height: 54px;
      .eth-icon {
        color: #fff;
        height: 30px;
        width: 30px;
        > svg {
          height: 100%;
        }
      }
      .favorite-button {
        z-index: 2;
        width: 30px;
        height: 30px;
        > svg {
          transition: 0.2s;
          width: 100%;
          height: 100%;
          fill: #fff;
          stroke-width: 10px;
          stroke: ${theme.blue};
        }
        &.isFavorite {
          > svg {
            fill: ${theme.blue};
            stroke: ${theme.secondaryBlue};
          }
        }
      }
    }
  }
`;

const NFTDetailImage = () => {
  const url = useSelector(getNFTURL);
  const cid = useSelector(getNFTCid);
  const isInFavorites = useSelector(getIsInFavorites(cid));
  const dispatch = useDispatch();

  const handleOpenImage = () => {
    dispatch(setActiveModal({ type: MODAL_TYPES.IMAGE_PREVIEW, props: { src: url } }));
  };

  const handleUpdateFavorites = () => dispatch(updateFavorites(cid));

  return (
    <ScNFTDetailImage>
      <div className="nft-detail-image-icons">
        <div className="eth-icon">
          <FaEthereum />
        </div>
        <button type="button" onClick={handleUpdateFavorites} className={classNames({ 'favorite-button': true, isFavorite: isInFavorites })}>
          <FavoriteIcon />
        </button>
      </div>
      {url && <img className="nft-detail-image" src={url} alt="nftImage" onClick={handleOpenImage} />}
    </ScNFTDetailImage>
  );
};

export default NFTDetailImage;
