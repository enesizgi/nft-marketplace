import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { setSignedMessage, setUser } from './userSlice';
import API from '../modules/api';
import { changeNetwork, generateSignatureData, serializeBigNumber } from '../utils';
import { setChainId, setIsLoadingContracts } from './marketplaceSlice';
import { setProfile } from './profileSlice';
import { loadNFT, setCurrentPath, setLoading } from './uiSlice';
import { NFT_ACTIVITY_TYPES } from '../constants';
import { getMarketplaceContractFn, getNFTContractFn } from '../components/utils';
import { setNFT } from './nftSlice';
import { initProfile } from './actionCreators';

/* eslint-disable */
const listenerMiddleware = createListenerMiddleware();

const userLoginFlow = async (id, listenerApi) => {
  const userExists = await API.checkUser(id);

  if (!userExists) {
    const { signature, message } = await generateSignatureData();
    const createdUser = await API.createUser(id, signature, message);
    if (!createdUser) {
      console.warn('User could not be created.');
    } else {
      listenerApi.dispatch(setUser({ ...createdUser, id: id.toLowerCase() }));
    }
  } else {
    const signature = localStorage.getItem('signature');
    const message = localStorage.getItem('signedMessage');
    const userInfo = await API.getUser(id);
    listenerApi.dispatch(setUser({ ...userInfo, id: id.toLowerCase() }));
    if (signature && message) listenerApi.dispatch(setSignedMessage({ signature, message }));
  }
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
    await changeNetwork(sessionChainId);
  }

  const id = sessionAccount || (await setAccounts());
  const chainIdOfAccount = sessionChainId || (await setChainIdOfAccount());

  listenerApi.dispatch(setChainId(chainIdOfAccount));

  await userLoginFlow(id, listenerApi);

  window.ethereum.on('chainChanged', chainId => {
    sessionStorage.setItem('chainId', chainId);
    listenerApi.dispatch(setChainId(chainId));
  });

  window.ethereum.on('accountsChanged', async accounts => {
    const newAccountId = accounts[0];
    sessionStorage.setItem('account', accounts[0]);
    await userLoginFlow(newAccountId, listenerApi);
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
  const isSameToken = tokenId === currentTokenId?.toString();
  const metadata = currentMetadata && isSameToken ? currentMetadata : await API.getFromIPFS(cid);

  // TODO @Enes: Cache mechanism for transactions maybe? Get events from mongodb?
  const transferQuery = mongoEvents.filter(e => e.type === 'Transfer' && e.from === ethers.constants.AddressZero);
  const boughtQuery = mongoEvents.filter(e => e.type === 'Bought');
  const offeredQuery = mongoEvents.filter(e => e.type === 'Offered');
  const auctionQuery = mongoEvents.filter(e => e.type === 'AuctionStarted');
  const auctionEndedQuery = mongoEvents.filter(e => e.type === 'AuctionEnded');
  const promiseList = await Promise.allSettled([transferQuery, boughtQuery, offeredQuery, auctionQuery, auctionEndedQuery]);
  const [transferPromise, ...eventPromiseList] = promiseList;
  const eventsArray = eventPromiseList.reduce((acc, eventPromise) => {
    if (eventPromise.status === 'fulfilled' && eventPromise.value != null) acc.push(eventPromise.value);
    else acc.push([]);
    return acc;
  }, []);
  const [boughtResults, , , auctionEndedResults] = eventsArray;
  const events = eventsArray.flat(1);
  const lastEvent = events.reduce((acc, event) => {
    if (acc === null) return event;
    if (parseFloat(`${event.blockNumber}.${event.transactionIndex}`) > parseFloat(`${acc.blockNumber}.${acc.transactionIndex}`)) return event;
    return acc;
  }, null);

  const sortFn = (a, b) => parseFloat(`${b.blockNumber}.${b.transactionIndex}`) - parseFloat(`${a.blockNumber}.${a.transactionIndex}`);
  const itemId = lastEvent?.itemId;
  const auctionId = lastEvent?.auctionId;

  let i;
  let totalPrice;
  if (lastEvent?.type === 'Offered' || lastEvent?.type === 'AuctionStarted') {
    if (itemId) {
      i = await marketplaceContract.items(itemId);
      totalPrice = await marketplaceContract.getTotalPrice(itemId);
    } else if (auctionId) {
      i = await marketplaceContract.auctionItems(auctionId);
    }
  }
  // TODO: handle if data comes from ipfs
  const it = {
    metadata,
    tokenId: tokenId,
    ...(itemId ? { itemId: parseInt(itemId._hex, 16) } : {}),
    ...(i ?? {}),
    ...(totalPrice ? { totalPrice } : {}),
    ...(i?.price ? { price: i.price } : {})
  };

  const removeIndexKeys = obj => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!isNaN(parseInt(key))) return acc; // Remove 0,1,2,3,4,5,... keys from object.
      acc[key] = value;
      return acc;
    }, {});
  };

  const finalItem = removeIndexKeys(serializeBigNumber(it));

  const nftTransactionData = [...boughtResults, ...auctionEndedResults, ...(transferPromise.value || [])].sort(sortFn).map(e => {
    const isMintTransaction = e.type === 'Transfer' && e.from === ethers.constants.AddressZero;
    return {
      event: e.event,
      ...(e.args ? { args: removeIndexKeys(serializeBigNumber(e.args)) } : {}),
      type: isMintTransaction ? NFT_ACTIVITY_TYPES.MINT : NFT_ACTIVITY_TYPES.SALE,
      ...(e.price ? { price: isMintTransaction ? '' : ethers.utils.formatEther(ethers.BigNumber.from(e.price.toString())) } : {}),
      from: isMintTransaction ? 'Null' : e.seller,
      to: isMintTransaction ? e.to ?? e.to : e.buyer,
      blockNumber: e.blockNumber,
      blockHash: e.blockHash,
      transactionHash: e.transactionHash
    };
  });
  const nftOffers = await marketplaceContract.getERCOffers(tokenId);
  const offers = nftOffers
    .map(e => {
      if (e.offerer === ethers.constants.AddressZero) {
        return;
      }
      return {
        offerIndex: serializeBigNumber(e.offerIndex),
        offerer: e.offerer.toLowerCase(),
        amount: serializeBigNumber(e.amount),
        tokenId: serializeBigNumber(e.tokenId),
        deadline: serializeBigNumber(e.deadline)
      };
    })
    .filter(item => item);

  const isNFTOwnedByMarketplace = owner === marketplaceContract.address.toLowerCase();
  const isListed = isNFTOwnedByMarketplace && lastEvent?.type === 'Offered';
  const isOnAuction = isNFTOwnedByMarketplace && lastEvent?.type === 'AuctionStarted';

  const seller = isListed || isOnAuction ? lastEvent.seller.toLowerCase() : '';

  listenerApi.dispatch(setNFT({ ...finalItem, transactions: nftTransactionData, offers: offers, owner, seller, isListed, isOnAuction }));
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
  matcher: isAnyOf(setCurrentPath, loadNFT),
  effect: handlePathChanges
});

export default listenerMiddleware;
