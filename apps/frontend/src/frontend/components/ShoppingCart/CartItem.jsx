import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import API from '../../modules/api';
import { ReactComponent as TrashIcon } from '../../assets/trash-icon.svg';

const ScCartItem = styled.div`
  display: flex;
  width: 100%;
  margin: 15px 0;
  padding-left: 10px;
  border-radius: 8px;
  box-shadow: 0 0 6px #fff;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 10px #fff;
  }
  .nftImage {
    padding: 10px 0;
    align-self: center;
    width: 30%;
    margin-right: 20px;
    & > img {
      object-fit: contain;
    }
  }
  .nftInfo {
    padding: 10px 0;
    width: 50%;
    &-name {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      @media screen and (max-width: 480px) {
        font-size: 18px;
      }
    }
    &-description {
      font-size: 16px;
      @media screen and (max-width: 480px) {
        font-size: 12px;
      }
    }
  }
  .trash {
    align-self: center;
    width: 40px;
    height: 40px;
    padding: 8px;
    background: red;
    border-radius: 50%;
    margin-right: 10px;
    @media screen and (max-width: 480px) {
      height: 100%;
      width: 30px;
      padding: 5px;
      border-radius: 0;
      border-bottom-right-radius: 8px;
      border-top-right-radius: 8px;
      margin-right: 0;
    }
    margin-left: auto;
    & > svg {
      width: 100%;
      height: 100%;
      fill: #fff;
    }
  }
`;

const CartItem = ({ cid, onRemoveFromList }) => {
  const [nftInfo, setNftInfo] = useState({});
  // const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      API.getFromIPFS(cid).then(setNftInfo);
    })();
  }, [cid]);

  const handleGoToNFTDetailPage = () => {
    // navigate('/nft/')// needs tokenId
  };

  return (
    <ScCartItem onClick={handleGoToNFTDetailPage}>
      <div className="nftImage">
        <img alt="nftImage" src={nftInfo.url} />
      </div>
      <div className="nftInfo">
        <h2 className="nftInfo-name">{nftInfo.name}</h2>
        <p className="nftInfo-description">{nftInfo.description}</p>
      </div>
      <button type="button" className="trash" onClick={onRemoveFromList}>
        <TrashIcon />
      </button>
    </ScCartItem>
  );
};

export default CartItem;
