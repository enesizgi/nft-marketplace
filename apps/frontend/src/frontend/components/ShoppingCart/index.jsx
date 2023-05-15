import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { SHOPPING_TYPES } from '../../constants';
import Switch from '../Switch';
import { getCart, getChainId, getMarketplaceContract, getNFTContract, getUserFavorites, getUserId } from '../../store/selectors';
import CartItem from './CartItem';
import Button from '../Button';
import { updateCart, updateFavorites } from '../../store/actionCreators';
import API from '../../modules/api';
import LoadingSpinner from '../LoadingSpinner';
import { setToast } from '../../store/uiSlice';
import { setCart } from '../../store/userSlice';

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
    margin: 10px 0;
  }
  .cart-footer {
    border-top: 2px solid #969696;
    display: flex;
    justify-content: end;
    flex-wrap: wrap;
    align-items: center;
    padding: 25px 0;
    font-size: 24px;
    @media screen and (max-width: 768px) {
      font-size: 18px;
    }
    &-total {
      font-weight: 600;
      margin-right: 30px;
      @media screen and (max-width: 480px) {
        width: 100%;
        margin: 0 0 30px;
        text-align: right;
      }
    }
    &-button {
      @media screen and (max-width: 480px) {
        width: 100%;
      }
    }
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
  const userId = useSelector(getUserId);
  const userFavorites = useSelector(getUserFavorites);
  const cart = useSelector(getCart);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const [favoritesInfo, setFavoritesInfo] = useState([]);
  const [cartInfo, setCartInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;
    if (userFavorites.length > 0 || cart.length > 0) {
      (async () => {
        const response = await API.getNft({
          tokenId: JSON.stringify([...(userFavorites || []), ...(cart || [])]),
          nftContract: nftContract.address,
          network: chainId
        });
        setFavoritesInfo(response ? response.filter(nft => userFavorites.includes(nft.tokenId)) : []);
        setCartInfo(response ? response.filter(nft => cart.includes(nft.tokenId)) : []);
      })();
    }
    if (cart.length === 0) setCartInfo([]);
    if (userFavorites.length === 0) setFavoritesInfo([]);
  }, [userFavorites, chainId, nftContract, cart, userId]);

  const formattedPrice = useMemo(
    () =>
      ethers.utils
        .formatEther(
          cartInfo.reduce((prev, item) => {
            if (item.price) {
              return prev.add(item.price);
            }
            return prev;
          }, ethers.BigNumber.from('0'))
        )
        .toString(),
    [cartInfo]
  );

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

  const handleCompletePurchase = async () => {
    setIsLoading(true);
    try {
      const listedItemIds = listedItems.map(item => item.itemId);
      await (await marketplaceContract.purchaseItem(listedItemIds, { value: ethers.utils.parseEther(formattedPrice) })).wait();
      dispatch(setCart([])); // TODO: purchase success screen should be added
    } catch (e) {
      dispatch(
        setToast({
          title: 'Purchase cannot be completed.',
          duration: 9000,
          status: 'error'
        })
      );
    }
    setIsLoading(false);
  };

  return (
    <ScShoppingCart>
      {isLoading ? (
        <LoadingSpinner message="Completing purchase" />
      ) : (
        <>
          <div className="switch-container">
            <Switch keys={Object.values(SHOPPING_TYPES)} selected={selectedTab} onChange={setSelectedTab} />
          </div>
          {listedItems.length > 0 && <h1 className="title">Your {selectedTab}</h1>}
          <div className="nfts-container">
            {listedItems.length > 0 ? (
              listedItems.map(i => <CartItem key={Math.random()} nftInfo={i} onRemoveFromList={e => handleRemoveFromList(e, i.tokenId)} />)
            ) : (
              <div className="emptyCart">
                <p className="emptyCart-text">There is no item in your {selectedTab.toLowerCase()} yet.</p>
                <Link to="/">
                  <Button className="emptyCart-button">Start Shopping</Button>
                </Link>
              </div>
            )}
          </div>
          {selectedTab === SHOPPING_TYPES.CART && listedItems.length > 0 && (
            <div className="cart-footer">
              <p className="cart-footer-total">Total: {formattedPrice} ETH</p>
              <Button className="cart-footer-button" onClick={handleCompletePurchase}>
                Complete purchase
              </Button>
            </div>
          )}
        </>
      )}
    </ScShoppingCart>
  );
};

export default ShoppingCart;
