import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as CheckIcon } from '../../assets/check-icon.svg';
import { theme } from '../../constants';
import Button from '../Button';

const ScShoppingSuccess = styled.div`
  width: 70%;
  @media screen and (max-width: 768px) {
    width: 90%;
  }
  margin: 30px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  .check-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
    @media screen and (max-width: 768px) {
      width: 50px;
      height: 50px;
    }
    fill: ${theme.blue};
  }
  .success-message {
    text-align: center;
    margin-bottom: 20px;
  }
  font-size: 36px;
  @media screen and (max-width: 768px) {
    font-size: 24px;
  }
  .shoppingSuccess-footer {
    display: flex;
    @media screen and (max-width: 480px) {
      flex-direction: column;
    }
    button {
      font-size: 24px;
      padding: 10px 20px;
      width: unset;
      height: unset;
      @media screen and (max-width: 768px) {
        font-size: 18px;
      }
    }
    .goToOwnedPage {
      margin-right: 20px;
      @media screen and (max-width: 480px) {
        margin: 0 0 20px;
      }
    }
  }
`;

const ShoppingSuccess = ({ userId, setIsSuccess }) => {
  const navigate = useNavigate();
  return (
    <ScShoppingSuccess>
      <CheckIcon className="check-icon" />
      <p className="success-message">Shopping is completed successfully</p>
      <div className="shoppingSuccess-footer">
        <Button className="goToOwnedPage" onClick={() => navigate(`/user/${userId}`, { state: { owned: true } })}>
          Go to owned NFTs
        </Button>
        <Button className="backToCart" onClick={() => setIsSuccess(false)}>
          Back to cart
        </Button>
      </div>
    </ScShoppingSuccess>
  );
};

export default ShoppingSuccess;
