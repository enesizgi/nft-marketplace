import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORK_IDS } from 'contracts';
import { resetUser, setCart, setShoppingLists, setUser, setUserFavorites } from './userSlice';
import API from '../modules/api';
import { changeNetwork, serializeBigNumber, signatureGenerator } from '../utils';
import { setChainId } from './marketplaceSlice';
import { setProfile } from './profileSlice';
import { loadNFT, setCurrentPath, setLoading } from './uiSlice';
import { defaultChainId, NFT_ACTIVITY_TYPES } from '../constants';
import { dispatchToastHandler, getMarketplaceContractFn, getNFTContractFn } from '../components/utils';
import { setNFT } from './nftSlice';
import { initProfile } from './actionCreators';
import { setListedItems } from './listingSlice';

/* eslint-disable */
const listenerMiddleware = createListenerMiddleware();

const userLoginFlow = async (id, chainId, listenerApi) => {
  let user = await API.getUser(id);

  if (!user) {
    const result = await signatureGenerator.generateSignatureData();
    if (result && result.signature && result.message) {
      const createdUser = await API.createUser(id);
      if (!createdUser) {
        console.warn('User could not be created.');
        return;
      }
      user = createdUser;
    }
  }
  const shoppingLists = await API.getShoppingLists(id, chainId);
  user = { ...user, id: id.toLowerCase(), cart: shoppingLists?.cart ?? [], favorites: shoppingLists?.favorites ?? [] };
  listenerApi.dispatch(setUser(user));
  return user;
};

const getAccounts = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
};

const getChainIdOfAccount = async () => {
  return await window.ethereum.request({ method: 'eth_chainId' });
};

const handleInitMarketplace = async (action, listenerApi) => {
  if (!window.ethereum) {
    const dispatchToast = dispatchToastHandler(listenerApi.dispatch);
    dispatchToast('You should install Metamask.');
    return;
  }
  const chainIdOfAccount = await getChainIdOfAccount();
  if (chainIdOfAccount) listenerApi.dispatch(setChainId(chainIdOfAccount));
  const id = await getAccounts();

  const user = await userLoginFlow(id, chainIdOfAccount, listenerApi);

  if (chainIdOfAccount && !CONTRACTS[chainIdOfAccount]) {
    const result = await changeNetwork(defaultChainId);
    if (result) listenerApi.dispatch(setChainId(defaultChainId));
    if (!result) {
      const dispatchToast = dispatchToastHandler(listenerApi.dispatch);
      dispatchToast('You should change your network from navigation bar.');
    }
  }

  window.ethereum.on('chainChanged', async chainId => {
    listenerApi.dispatch(setChainId(chainId));
    const userId = await getAccounts();
    const { cart, favorites } = API.getShoppingLists(userId, chainId);
    listenerApi.dispatch(setShoppingLists({ cart, favorites }));
  });

  window.ethereum.on('accountsChanged', async accounts => {
    listenerApi.dispatch(resetUser());
    const newAccountId = accounts[0];
    localStorage.removeItem('signature');
    localStorage.removeItem('signedMessage');
    const chainId = await getChainIdOfAccount();
    await userLoginFlow(newAccountId, chainId, listenerApi);
    await handleInitMarketplace(action, listenerApi);
  });

  const userId = user?.id ?? listenerApi.getState().user.id;
  const {
    marketplace: { chainId }
  } = listenerApi.getState();

  const marketplaceContract = await getMarketplaceContractFn(userId, chainId);
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const filter = {
    address: marketplaceContract.address
  };

  provider.on(filter, async (log, event) => {
    // TODO @Enes: We should improve this to only fetch when current nft state changed.
    // Currently, it triggers on every transaction on marketplace contract.
    if (window.location.href.includes('/nft/')) {
      listenerApi.dispatch(loadNFT());
    }
  });
};

const handleInitProfile = async (action, listenerApi) => {
  const path = action.payload;
  const getUserRequest = path.startsWith('0x') ? API.getUser : API.getUserBySlug;
  const response = await getUserRequest(path);
  listenerApi.dispatch(setProfile({ ...response, id: response.id.toLowerCase() }));
};

const handleInitNFTState = async (action, listenerApi) => {
  listenerApi.cancelActiveListeners();
  await listenerApi.delay(200);
  listenerApi.dispatch(setLoading(true));
  const {
    user: { id: userId },
    nft: { metadata: currentMetadata, tokenId: currentTokenId }
  } = listenerApi.getState();
  const { tokenId, chainId } = action.payload;
  const marketplaceContract = await getMarketplaceContractFn(userId, chainId);
  const nftContract = await getNFTContractFn(userId, chainId);
  const _nftOwner = await nftContract.ownerOf(tokenId);
  const owner = _nftOwner.toLowerCase();
  const uri = await nftContract.tokenURI(tokenId);
  const cid = uri.split('ipfs://')[1];
  const mongoEvents = await API.getEvents({ network: chainId, nft: nftContract.address, tokenId: parseInt(tokenId) });
  const nftStatusAuction = await API.getNftStatus({
    network: chainId,
    marketplaceContract: marketplaceContract.address,
    nftContract: nftContract.address,
    tokenId: parseInt(tokenId),
    type: 'Auction',
    limit: 1
  });
  const nftStatusListing = await API.getNftStatus({
    network: chainId,
    marketplaceContract: marketplaceContract.address,
    nftContract: nftContract.address,
    tokenId: parseInt(tokenId),
    type: 'Listing',
    limit: 1
  });
  // let bidEvents = [];
  // if (nftStatusAuction.length > 0) {
  //   bidEvents = await API.getEvents({
  //     network: chainId,
  //     marketplaceContract: CONTRACTS[chainId].MARKETPLACE.address,
  //     type: 'BidPlaced',
  //     auctionId: nftStatusAuction[0].auctionId
  //   });
  //   bidEvents = bidEvents.sort((a, b) => ethers.BigNumber.from(b.amount) - ethers.BigNumber.from(a.amount));
  // }
  const isSameToken = tokenId === currentTokenId?.toString();
  const metadata = currentMetadata && isSameToken ? currentMetadata : await API.getFromIPFS(cid);

  const sortFn = (a, b) => parseFloat(`${b.blockNumber}.${b.transactionIndex}`) - parseFloat(`${a.blockNumber}.${a.transactionIndex}`);

  let i;
  let totalPrice;
  if (nftStatusAuction.length > 0 && !nftStatusAuction[0].claimed && !nftStatusAuction[0].canceled) {
    i = await marketplaceContract.auctionItems(nftStatusAuction[0].auctionId);
  } else if (nftStatusListing.length > 0 && !nftStatusListing[0].sold && !nftStatusListing[0].canceled) {
    i = await marketplaceContract.items(nftStatusListing[0].itemId);
    totalPrice = await marketplaceContract.getTotalPrice(nftStatusListing[0].itemId);
  }

  const removeIndexKeys = obj => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!isNaN(parseInt(key))) return acc; // Remove 0,1,2,3,4,5,... keys from object.
      acc[key] = value;
      return acc;
    }, {});
  };

  const finalItem = removeIndexKeys(
    serializeBigNumber({
      ...(i ?? {}),
      ...(totalPrice ? { totalPrice } : {}),
      metadata,
      tokenId: parseInt(tokenId)
    })
  );

  const nftTransactionData = mongoEvents
    .filter(e => (e.from === ethers.constants.AddressZero ? e.type === 'Transfer' : ['Bought', 'AuctionEnded'].includes(e.type)))
    .sort(sortFn)
    .map(e => {
      const isMintTransaction = e.type === 'Transfer' && e.from === ethers.constants.AddressZero;
      return {
        event: e.event,
        ...(e.args ? { args: removeIndexKeys(serializeBigNumber(e.args)) } : {}),
        type: isMintTransaction ? NFT_ACTIVITY_TYPES.MINT : NFT_ACTIVITY_TYPES.SALE,
        ...(e.price ? { price: isMintTransaction ? '' : ethers.utils.formatEther(ethers.BigNumber.from(e.price.toString())) } : {}),
        from: isMintTransaction ? ethers.constants.AddressZero : e.seller,
        to: isMintTransaction ? e.to ?? e.to : e.buyer,
        blockNumber: e.blockNumber,
        blockHash: e.blockHash,
        transactionHash: e.transactionHash
      };
    });
  const nftOffers = await API.getOffers(tokenId);
  const offers = nftOffers
    ?.map(e => {
      if (!e.offerer || e.offerer === ethers.constants.AddressZero) {
        return;
      }
      return {
        offerer: e.offerer.toLowerCase(),
        amount: serializeBigNumber(ethers.BigNumber.from(e.amount.toString())),
        deadline: serializeBigNumber(ethers.BigNumber.from(e.deadline.toString())),
        v: e.v,
        r: e.r,
        s: e.s
      };
    })
    .filter(item => item);

  const nftBids = await API.getBids(tokenId);
  const bids = nftBids
    ?.map(e => {
      if (!e.bidder || e.bidder === ethers.constants.AddressZero) {
        return;
      }
      return {
        bidder: e.bidder.toLowerCase(),
        amount: serializeBigNumber(ethers.BigNumber.from(e.amount.toString())),
        deadline: serializeBigNumber(ethers.BigNumber.from(e.deadline.toString())),
        v: e.v,
        r: e.r,
        s: e.s,
        createdAt: e.doc_updated_at
      };
    })
    .filter(item => item)
    .sort((a, b) => ethers.BigNumber.from(b.amount) - ethers.BigNumber.from(a.amount));

  const isListed = nftStatusListing.length > 0 && !nftStatusListing[0].sold && !nftStatusListing[0].canceled;
  const isOnAuction = nftStatusAuction.length > 0 && !nftStatusAuction[0].claimed && !nftStatusAuction[0].canceled;

  let seller = isListed ? nftStatusListing[0].seller.toLowerCase() : '';
  seller = isOnAuction ? nftStatusAuction[0].seller.toLowerCase() : seller;

  if (listenerApi.getState().marketplace.chainId === chainId && listenerApi.getState().user.id === userId) {
    listenerApi.dispatch(
      setNFT({
        ...finalItem,
        transactions: nftTransactionData,
        offers: offers,
        bids: bids,
        owner,
        seller,
        isListed,
        isOnAuction,
        lastUpdate: Date.now()
      })
    );
    listenerApi.dispatch(setLoading(false));
  }
};

const handlePathChanges = async (action, listenerApi) => {
  const isInNFTPage = window.location.pathname.startsWith('/nft/');
  const isInProfilePage = window.location.pathname.startsWith('/user/');
  const pathName = window.location.pathname.split('/');
  // TODO @Enes: Get chain id from the url. This way we can support multiple chains by only knowing url.

  if (isInNFTPage) {
    const tokenId = pathName[4];
    const chainId = NETWORK_IDS[pathName[2].toUpperCase()];
    if (chainId) await handleInitNFTState({ payload: { tokenId, chainId } }, listenerApi);
  } else {
    // If we are not in NFT page, clear the state.
    // Also, don't clear the state if it is already cleared.
    if (listenerApi.getState().nft.tokenId !== undefined) {
      listenerApi.dispatch(setNFT({}));
    }
  }
  if (isInProfilePage) {
    // Initialize profile again even for the same id to see the updates.
    const pathId = pathName[2];
    listenerApi.dispatch(initProfile(pathId));
  }
};

const handleUpdateCart = async (action, listenerApi) => {
  try {
    const {
      user: { id, cart },
      ui: { currentPath },
      marketplace: { chainId }
    } = listenerApi.getState();
    const isAddition = !cart.find(tokenId => tokenId === action.payload);
    const updatedCart = isAddition ? [...cart, action.payload] : cart.filter(tokenId => tokenId !== action.payload);
    const result = await API.setCart(id, chainId, updatedCart);
    listenerApi.dispatch(setCart(result?.cart));
    if (isAddition) {
      const dispatchToast = dispatchToastHandler(listenerApi.dispatch);
      dispatchToast('Item added to your cart.', 'success');
    } else if (currentPath !== '/cart') {
      const dispatchToast = dispatchToastHandler(listenerApi.dispatch);
      dispatchToast('Item removed from your cart.', 'error');
    }
  } catch (e) {
    console.log(e);
  }
};

const handleSearch = async (action, listenerApi) => {
  const searchTerm = action.payload;
  if (!searchTerm) {
    listenerApi.dispatch(setListedItems({}));
    return;
  }
  const response = await API.search({ searchTerm });
  if (response) {
    listenerApi.dispatch(setListedItems(response));
  } else {
    listenerApi.dispatch(setListedItems({}));
  }
};

const handleUpdateFavorites = async (action, listenerApi) => {
  try {
    const {
      user: { id, favorites },
      ui: { currentPath },
      marketplace: { chainId }
    } = listenerApi.getState();
    const isAddition = !favorites.find(tokenId => tokenId === action.payload);
    const updatedFavorites = isAddition ? [...favorites, action.payload] : favorites.filter(tokenId => tokenId !== action.payload);
    const result = await API.setUserFavorites(id, chainId, updatedFavorites);
    listenerApi.dispatch(setUserFavorites(result?.favorites));
    if (isAddition) {
      const dispatchToast = dispatchToastHandler(listenerApi.dispatch);
      dispatchToast('Item added to your favorites.', 'success');
    } else if (currentPath !== '/cart') {
      const dispatchToast = dispatchToastHandler(listenerApi.dispatch);
      dispatchToast('Item removed from your favorites.', 'error');
    }
  } catch (e) {
    console.log(e);
  }
};

listenerMiddleware.startListening({
  type: 'INIT_MARKETPLACE',
  effect: handleInitMarketplace
});

listenerMiddleware.startListening({
  type: 'INIT_PROFILE',
  effect: handleInitProfile
});

listenerMiddleware.startListening({
  type: 'INIT_NFT',
  effect: handleInitNFTState
});

listenerMiddleware.startListening({
  type: 'UPDATE_FAVORITES',
  effect: handleUpdateFavorites
});

listenerMiddleware.startListening({
  type: 'UPDATE_CART',
  effect: handleUpdateCart
});

listenerMiddleware.startListening({
  type: 'SET_SEARCH_TERM',
  effect: handleSearch
});

listenerMiddleware.startListening({
  matcher: isAnyOf(setCurrentPath, loadNFT),
  effect: handlePathChanges
});

export default listenerMiddleware;
