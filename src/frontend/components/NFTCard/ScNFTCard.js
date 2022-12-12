import styled from 'styled-components';

const ScNFTCard = styled.div`
  border: none;
  border-radius: 5%;
  overflow: hidden;
  cursor: pointer;
  height: 300px;

  box-shadow: 0 0 6px rgba(35, 37, 42, 0.3);
  margin: 10px 10px;

  :hover {
    box-shadow: 0 0 10px rgba(35, 37, 42, 0.7);
    .nft-info-price-text {
      display: none;
    }
    .nft-image {
      & > img {
        transform: scale(1.2);
      }
    }
  }

  .nft-image {
    overflow: hidden;
    width: 100%;
    height: 70%;
    & > img {
      object-fit: contain;
      width: 100%;
      height: 100%;
      transition: 0.2s ease;
    }
  }

  .nft-info {
    width: 100%;
    height: 30%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    &-name {
      padding: 5px 10px;
      height: 50%;
      width: 100%;
      margin-bottom: 5px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      &-seller {
        border: 0;
        background: inherit;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50%;
        font-size: 12px;
        :hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      &-itemName {
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 24px;
        line-height: 100%;
        font-weight: 700;
      }
    }
    &-price {
      height: 50%;
      box-sizing: border-box;
      bottom: 0;
      width: 100%;
      text-align: center;
      &-text {
        font-size: 18px;
        font-weight: 600;
      }
      @keyframes slide {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(0);
        }
      }
      &-sell,
      &-buy {
        background: #0089a8;
        width: 100%;
        animation: 0.4s ease 0s 1 slide;
        height: 100%;
        border: 0;
        font-size: 18px;
        font-weight: 800;
        color: #fff;
        cursor: pointer;
      }
    }
  }
`;

export default ScNFTCard;
