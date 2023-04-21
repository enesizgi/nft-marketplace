import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SHOPPING_TYPES } from '../../constants';
import Switch from '../Switch';
import { getCart, getChainId, getNFTContract, getUserFavorites } from '../../store/selectors';
import CartItem from './CartItem';
import Button from '../Button';
import { updateCart, updateFavorites } from '../../store/actionCreators';
import API from '../../modules/api';

const ScShoppingCart = styled.div`
  margin: 0 auto;
  height: 100%;
  width: 100%;
  padding: 2%;
  @media screen and (max-width: 768px) {
    padding: 16px 24px;
  }
  max-width: 800px;
  display: flex;
  flex-direction: column;
  .switch-container {
    margin: 20px auto;
  }
  .title {
    align-self: flex-start;
    font-size: 36px;
    @media screen and (max-width: 768px) {
      font-size: 28px;
    }
  }
  .nfts-container {
    display: flex;
    flex-direction: column;
  }
  .emptyCart {
    margin: auto;
    &-text {
      text-align: center;
      margin: 20px auto;
      font-size: 36px;
      @media screen and (max-width: 768px) {
        font-size: 28px;
      }
      @media screen and (max-width: 480px) {
        font-size: 24px;
      }
    }
    &-button {
      margin: auto;
      padding: 5px 20px;
    }
  }
`;

const ShoppingCart = () => {
  const nftContract = useSelector(getNFTContract);
  const chainId = useSelector(getChainId);
  const userFavorites = useSelector(getUserFavorites);
  const cart = useSelector(getCart);
  const [favoritesInfo, setFavoritesInfo] = useState([]);
  const [cartInfo, setCartInfo] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userFavorites.length > 0 || cart.length > 0) {
      (async () => {
        const response = await API.getNft({
          tokenId: JSON.stringify([...(userFavorites || []), ...(cart || [])]),
          nftContract: nftContract.address,
          network: chainId
        });
        setFavoritesInfo(response.filter(nft => userFavorites.includes(nft.tokenId)));
        setCartInfo(response.filter(nft => cart.includes(nft.tokenId)));
      })();
    }
    if (cart.length === 0) setCartInfo([]);
    if (userFavorites.length === 0) setFavoritesInfo([]);
  }, [userFavorites, chainId, nftContract, cart]);

  const [selectedTab, setSelectedTab] = useState(SHOPPING_TYPES.CART);
  const listedItems = selectedTab === SHOPPING_TYPES.CART ? cartInfo : favoritesInfo;

  const handleRemoveFromList = async (e, tokenId) => {
    e.stopPropagation();
    if (selectedTab === SHOPPING_TYPES.CART) {
      dispatch(updateCart(tokenId));
    } else {
      dispatch(updateFavorites(tokenId));
    }
  };

  return (
    <ScShoppingCart>
      <div className="switch-container">
        <Switch keys={Object.values(SHOPPING_TYPES)} selected={selectedTab} onChange={setSelectedTab} />
      </div>
      {listedItems.length > 0 && <h1 className="title">Your {selectedTab}</h1>}
      <div className="nfts-container">
        {listedItems.length > 0 ? (
          listedItems.map(i => <CartItem key={i.tokenId} nftInfo={i} onRemoveFromList={e => handleRemoveFromList(e, i.tokenId)} />)
        ) : (
          <div className="emptyCart">
            <p className="emptyCart-text">There is no item in your {selectedTab.toLowerCase()} yet.</p>
            <Link to="/">
              <Button className="emptyCart-button">Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </ScShoppingCart>
  );
};

export default ShoppingCart;
