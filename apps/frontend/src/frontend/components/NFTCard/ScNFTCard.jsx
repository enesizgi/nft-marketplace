import styled from 'styled-components';
import { theme } from '../../constants';

const ScNFTCard = styled.div`
  border: none;
  border-radius: 5%;
  overflow: hidden;
  cursor: pointer;
  height: 300px;
  position: relative;

  box-shadow: 0 0 6px #fff;
  margin: 10px 10px;

  :hover {
    box-shadow: 0 0 10px #fff;
    .nft-image {
      & > img {
        transform: scale(1.2);
      }
    }
  }

  .favorite-icon {
    z-index: 2;
    width: 25px;
    height: 25px;
    position: absolute;
    top: 10px;
    right: 10px;
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

  .nft-image {
    display: flex;
    align-items: center;
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
    color: #fff;
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
        display: flex;
        align-items: center;
        justify-content: center;
        > svg {
          width: 18px;
          height: 18px;
          margin-right: 5px;
          fill: #fff;
        }
        background: ${theme.blue};
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

  .shimmer {
    fill: #fff;
    margin: auto;
    width: 80%;
    display: inline-block;
    -webkit-mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
    background-repeat: no-repeat;
    animation: shimmer 2.5s infinite;
    font-size: 50px;
  }

  @keyframes shimmer {
    100% {
      -webkit-mask-position: left;
    }
  }
`;

export default ScNFTCard;
