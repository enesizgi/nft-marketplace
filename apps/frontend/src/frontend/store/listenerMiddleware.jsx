import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { CONTRACTS } from 'contracts';
import { setCart, setUser, setUserFavorites, setShoppingLists } from './userSlice';
import API from '../modules/api';
import { changeNetwork, generateSignatureData, serializeBigNumber } from '../utils';
import { setChainId, setIsLoadingContracts } from './marketplaceSlice';
import { setProfile } from './profileSlice';
import { loadNFT, setCurrentPath, setLoading, setToast } from './uiSlice';
import { NFT_ACTIVITY_TYPES } from '../constants';
import { getMarketplaceContractFn, getNFTContractFn } from '../components/utils';
import { setNFT } from './nftSlice';
import { initProfile } from './actionCreators';

/* eslint-disable */
const listenerMiddleware = createListenerMiddleware();

const userLoginFlow = async (id, chainId, listenerApi) => {
  let user = await API.getUser(id);

  if (!user) {
    const { signature, message } = await generateSignatureData();
    if (!signature) {
      return;
    }
    const createdUser = await API.createUser(id, signature, message);
    if (!createdUser) {
      console.warn('User could not be created.');
      return;
    }
    user = createdUser;
  }
  const { cart, favorites } = await API.getShoppingLists(id, chainId);
  console.log('api returned', { cart, favorites });
  listenerApi.dispatch(setUser({ ...user, id: id.toLowerCase(), cart, favorites }));
};

const setAccounts = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  sessionStorage.setItem('account', accounts[0]);
  return accounts[0];
};

const setChainIdOfAccount = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  sessionStorage.setItem('chainId', chainId);
  return chainId;
};

const handleInitMarketplace = async (action, listenerApi) => {
  const sessionAccount = sessionStorage.getItem('account');
  const sessionChainId = sessionStorage.getItem('chainId');
  const metamaskChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (sessionChainId && sessionChainId !== metamaskChainId) {
    const success = await changeNetwork(sessionChainId);
    if (!success) return;
  }

  const id = sessionAccount || (await setAccounts());
  const chainIdOfAccount = sessionChainId || (await setChainIdOfAccount());

  listenerApi.dispatch(setChainId(chainIdOfAccount));

  await userLoginFlow(id, chainIdOfAccount, listenerApi);

  window.ethereum.on('chainChanged', chainId => {
    sessionStorage.setItem('chainId', chainId);
    listenerApi.dispatch(setChainId(chainId));
    const userId = sessionStorage.getItem('account');
    const { cart, favorites } = API.getShoppingLists(userId, chainId);
    listenerApi.dispatch(setShoppingLists({ cart, favorites }));
  });

  window.ethereum.on('accountsChanged', async accounts => {
    const newAccountId = accounts[0];
    sessionStorage.setItem('account', accounts[0]);
    const chainId = sessionChainId || (await setChainIdOfAccount());
    await userLoginFlow(newAccountId, chainId, listenerApi);
    await handleInitMarketplace(action, listenerApi);
  });

  const {
    user: { id: userId },
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

  listenerApi.dispatch(setIsLoadingContracts(false));
};

const handleInitProfile = async (action, listenerApi) => {
  const path = action.payload;
  const getUserRequest = path.startsWith('0x') ? API.getUser : API.getUserBySlug;
  const response = await getUserRequest(path);
  listenerApi.dispatch(setProfile({ ...response, id: response.id.toLowerCase() }));
};

const handleInitNFTState = async (action, listenerApi) => {
  listenerApi.dispatch(setLoading(true));
  const {
    user: { id: userId },
    marketplace: { chainId },
    nft: { metadata: currentMetadata, tokenId: currentTokenId }
  } = listenerApi.getState();
  const tokenId = action.payload;

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
  let bidEvents = [];
  if (nftStatusAuction.length > 0) {
    bidEvents = await API.getEvents({
      network: chainId,
      marketplaceContract: CONTRACTS[chainId].MARKETPLACE.address,
      type: 'BidPlaced',
      auctionId: nftStatusAuction[0].auctionId
    });
    bidEvents = bidEvents.sort((a, b) => ethers.BigNumber.from(b.amount) - ethers.BigNumber.from(a.amount));
  }
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

  const isListed = nftStatusListing.length > 0 && !nftStatusListing[0].sold && !nftStatusListing[0].canceled;
  const isOnAuction = nftStatusAuction.length > 0 && !nftStatusAuction[0].claimed && !nftStatusAuction[0].canceled;

  let seller = isListed ? nftStatusListing[0].seller.toLowerCase() : '';
  seller = isOnAuction ? nftStatusAuction[0].seller.toLowerCase() : seller;

  listenerApi.dispatch(
    setNFT({ ...finalItem, transactions: nftTransactionData, offers: offers, bids: bidEvents, owner, seller, isListed, isOnAuction })
  );
  listenerApi.dispatch(setLoading(false));
};

const handlePathChanges = async (action, listenerApi) => {
  const pathName = window.location.pathname;
  const isInNFTPage = pathName.startsWith('/nft/');
  const isInProfilePage = pathName.startsWith('/user/');

  if (isInNFTPage) {
    const tokenId = pathName.split('/')[3];
    await handleInitNFTState({ payload: tokenId }, listenerApi);
  } else {
    // If we are not in NFT page, clear the state.
    // Also, don't clear the state if it is already cleared.
    if (listenerApi.getState().nft.tokenId !== undefined) {
      listenerApi.dispatch(setNFT({}));
    }
  }
  if (isInProfilePage) {
    // Initialize profile again even for the same id to see the updates.
    const pathId = pathName.split('/')[2];
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
      listenerApi.dispatch(
        setToast({
          title: 'Item added to your cart.',
          status: 'success'
        })
      );
    } else if (currentPath !== '/cart') {
      listenerApi.dispatch(
        setToast({
          title: 'Item removed from your cart.',
          status: 'error'
        })
      );
    }
  } catch (e) {
    console.log(e);
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
      listenerApi.dispatch(
        setToast({
          title: 'Item added to your favorites.',
          status: 'success'
        })
      );
    } else if (currentPath !== '/cart') {
      listenerApi.dispatch(
        setToast({
          title: 'Item removed from your favorites.',
          status: 'error'
        })
      );
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
  matcher: isAnyOf(setCurrentPath, loadNFT),
  effect: handlePathChanges
});

export default listenerMiddleware;
