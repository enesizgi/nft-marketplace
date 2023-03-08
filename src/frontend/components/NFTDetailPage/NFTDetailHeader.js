import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { BiRefresh } from 'react-icons/bi';
import { getNFTName, getNFTOwner, getNFTSeller, getNFTURL, getUserId } from '../../store/selectors';
import AddressDisplay from '../AddressDisplay';
import ShareDropdown from './ShareDropdown';
import './ShareDropdown.css';
import NewTab from './NFTOpenNewTab';
import { compare } from '../../utils';
import { loadNFT } from '../../store/uiSlice';

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
    &-nftName {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      height: 100%;
      width: 100%;
      font-size: 48px;
      font-weight: 600;
      word-wrap: break-word;

      @media screen and (max-width: 768px) {
        font-size: 36px;
      }

      .refresh-button {
        display: flex;
      }

      .btn-secondary {
        display: flex;
        margin: 0;
      }

      .nftTitle {
        flex: 80%;
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

const NFTDetailHeader = () => {
  const dispatch = useDispatch();
  const userId = useSelector(getUserId);
  const itemName = useSelector(getNFTName);
  const owner = useSelector(getNFTOwner);
  const seller = useSelector(getNFTSeller);
  const url = useSelector(getNFTURL);
  const isOwnerPage = compare(owner, userId);

  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const onFocus = () => {
      if (!isWindowFocused) setIsWindowFocused(true);
    };
    const onBlur = () => {
      if (isWindowFocused) setIsWindowFocused(false);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [isWindowFocused]);

  const handleReloadNftInfo = () => {
    dispatch(loadNFT());
  };

  useEffect(() => {
    if (isWindowFocused) {
      console.log('loadNFT');
      dispatch(loadNFT());
    }
    const intervalId = setInterval(() => {
      if (isWindowFocused) {
        console.log('loadNFT');
        dispatch(loadNFT());
      }
    }, 15000);
    return () => {
      console.log('clearInterval');
      clearInterval(intervalId);
    };
  }, [isWindowFocused]);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <div className="nft-header-name-nftName">
          <div className="nftTitle">{itemName}</div>
          <button type="button" className="refresh-button" onClick={handleReloadNftInfo}>
            <BiRefresh />
          </button>
          <NewTab url={url} />
          <ShareDropdown url={url} />
        </div>

        {!isOwnerPage && (
          <div className="nft-header-name-owner">
            <AddressDisplay address={seller || owner} label="Owned By" className="nft-header-name-owner-id" />
          </div>
        )}
      </div>
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
