import styled from 'styled-components';
import { theme } from '../../../constants';

const ScOfferModal = styled.div`
  width: 100%;
  @media screen and (max-width: 768px) {
    height: 100%;
  }

  display: flex;
  flex-direction: column;

  .nft-overview {
    display: flex;
    width: 100%;
    margin-bottom: 20px;

    &-image {
      width: 30%;
      height: auto;
    }

    &-text {
      width: 70%;
      margin-left: 20px;
      display: flex;
      flex-direction: column;

      &-name {
        font-size: 48px;
      }

      &-description {
        font-size: 18px;
      }
    }
  }

  .offer {
    &-label {
      font-size: 18px;
      font-weight: 600;
    }
    &-input {
      display: flex;
      justify-content: space-between;
      width: 200px;
      height: 50px;
      align-items: center;
      border: 2px solid ${theme.secondaryBlue};
      border-radius: 10px;
      margin: 10px 0 20px;

      > input {
        height: 100%;
        width: 80%;
        border: 0;
        border-radius: 10px;
        padding: 10px;
        font-size: 18px;
        outline: none;
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
      }

      #offer-price {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      #offer-date {
        width: 100%;
      }

      &-eth {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 35%;
        height: 100%;
        border-left: 2px solid rgba(35, 37, 42, 0.7);
        color: #fff;
      }
    }
  }
  .offer-modal-footer {
    display: flex;
    flex-direction: column;
    margin-top: auto;
    > span {
      color: red;
    }
    > button {
      @media screen and (min-width: 768px) {
        width: 50%;
        align-self: center;
      }
      margin-top: 10px;
    }
  }
`;

export default ScOfferModal;
