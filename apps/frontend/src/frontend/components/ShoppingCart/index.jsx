import React, { useEffect, useMemo, useState } from 'react';
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
import { setCart } from '../../store/userSlice';
import { dispatchToastHandler } from '../utils';

const ScShoppingCart = styled.div`
  margin: 0 auto;
  min-height: 100%;
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
  const [loadingMessage, setLoadingMessage] = useState('');
  const dispatch = useDispatch();

  const dispatchToast = dispatchToastHandler(dispatch);

  useEffect(() => {
    if (!userId) return;
    if (userFavorites.length > 0 || cart.length > 0) {
      (async () => {
        setLoadingMessage('Fetching NFTs...');
        setIsLoading(true);
        try {
          let response = await API.getNft({
            tokenId: JSON.stringify([...(userFavorites || []), ...(cart || [])]),
            nftContract: nftContract.address,
            network: chainId
          });
          response = response ?? [];
          response = await Promise.all(
            response.map(async nft => {
              try {
                if (nft.itemId != null) {
                  const price = await marketplaceContract.getTotalPrice(nft.itemId);
                  if (price) return { ...nft, price };
                }
              } catch (e) {
                console.error(e);
              }
              return nft;
            })
          );
          setFavoritesInfo(response.filter(nft => userFavorites.includes(nft.tokenId)));
          setCartInfo(response.filter(nft => cart.includes(nft.tokenId)));
        } catch (e) {
          console.error(e);
          setFavoritesInfo([]);
          setCartInfo([]);
        }
        setIsLoading(false);
      })();
    }
    if (cart.length === 0) setCartInfo([]);
    if (userFavorites.length === 0) setFavoritesInfo([]);
  }, [userFavorites, chainId, nftContract, cart, userId]);

  const totalPrice = useMemo(
    () =>
      cartInfo.reduce((prev, item) => {
        if (item.price) {
          return prev.add(item.price);
        }
        return prev;
      }, ethers.BigNumber.from('0')),
    [cartInfo]
  );

  const formattedPrice = useMemo(() => ethers.utils.formatEther(totalPrice).toString(), [totalPrice]);

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
    setLoadingMessage('Completing purchase...');
    setIsLoading(true);
    try {
      const listedItemIds = listedItems.map(item => item.itemId);
      await (await marketplaceContract.purchaseItem_multiple(listedItemIds, { value: totalPrice })).wait();
      dispatch(setCart([])); // TODO: purchase success screen should be added
    } catch (e) {
      dispatchToast('Purchase cannot be completed.', 'error', 9000);
    }
    setIsLoading(false);
  };

  return (
    <ScShoppingCart>
      {isLoading ? (
        <LoadingSpinner message={loadingMessage} />
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
