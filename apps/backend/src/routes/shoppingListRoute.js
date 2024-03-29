import express from 'express';
import ShoppingList from '../models/shopping_list';
import { SHOPPING_LIST_TYPES } from '../constants';
import { canAddedToShoppingList, verifyMessage } from '../utils';
import { userValidator } from './userRoute';

const router = express.Router();

const getShoppingCart = async (walletId, chainId) => {
  const result = await ShoppingList.findOne({ walletId, chainId, listType: SHOPPING_LIST_TYPES.CART }).lean();
  if (!result || !Object.keys(result).length) {
    return [];
  }
  const { items } = result;

  const cartItems = await Promise.all(items.map(async tokenId => ((await canAddedToShoppingList(chainId, tokenId, walletId)) ? tokenId : null)));
  return cartItems.filter(i => i !== null);
};

const getFavorites = async (walletId, chainId) => {
  const result = await ShoppingList.findOne({ walletId, chainId, listType: SHOPPING_LIST_TYPES.FAVORITES }).lean();
  if (!result || !Object.keys(result).length) {
    return [];
  }
  return result.items;
};

router.get('/shopping/cart', userValidator, verifyMessage, async (req, res) => {
  try {
    const { id: walletId, chainId } = req.query;
    const cart = await getShoppingCart(walletId, chainId);
    return res.send({ id: walletId, cart });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/shopping/cart', userValidator, verifyMessage, async (req, res) => {
  try {
    const { id: walletId, chainId } = req.query;
    const { cart } = req.body;
    const filteredCart = cart.filter(async tokenId => canAddedToShoppingList(chainId, tokenId, walletId)) ?? [];
    const result = await ShoppingList.findOneAndUpdate(
      {
        walletId,
        chainId,
        listType: SHOPPING_LIST_TYPES.CART
      },
      {
        items: filteredCart
      },
      { upsert: true, returnOriginal: false }
    ).lean();
    return res.send({ id: walletId, cart: result.items });
  } catch (err) {
    console.log(err);
  }
  return res.status(500).send();
});

router.get('/shopping/favorites', userValidator, verifyMessage, async (req, res) => {
  try {
    const { id: walletId, chainId } = req.query;
    const favorites = await getFavorites(walletId, chainId);
    return res.send({ id: walletId, favorites });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/shopping/favorites', userValidator, verifyMessage, async (req, res) => {
  try {
    const { id: walletId, chainId } = req.query;
    const { favorites } = req.body;
    const result = await ShoppingList.findOneAndUpdate(
      {
        walletId,
        chainId,
        listType: SHOPPING_LIST_TYPES.FAVORITES
      },
      {
        items: favorites ?? []
      },
      { upsert: true, returnOriginal: false }
    ).lean();
    return res.send({ id: walletId, favorites: result.items });
  } catch (err) {
    console.log(err);
  }
  return res.status(500).send();
});

router.get('/shopping', userValidator, verifyMessage, async (req, res) => {
  try {
    const { id: walletId, chainId } = req.query;
    const cart = await getShoppingCart(walletId, chainId);
    const favorites = await getFavorites(walletId, chainId);
    return res.send({ id: walletId, favorites, cart });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
