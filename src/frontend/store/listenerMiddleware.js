import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { setUser } from './userSlice';
import API from '../modules/api';
import { generateSignatureData } from '../utils';
import { setChainID, setIsLoadingContracts } from './marketplaceSlice';
import { setProfile } from './profileSlice';
import { loadNFT, setCurrentPath, setIsLoading } from './uiSlice';
import { NFT_ACTIVITY_TYPES } from '../constants';
import { getMarketplaceContractFn, getNFTContractFn } from '../components/utils';
import { setNFT } from './nftSlice';

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
      const { slug, name } = createdUser;
      listenerApi.dispatch(setUser({ id: id.toLowerCase(), slug, name }));
    }
  } else {
    const userInfo = await API.getUser(id);
    listenerApi.dispatch(setUser({ ...userInfo, id: id.toLowerCase() }));
  }
};

const setAccounts = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  sessionStorage.setItem('account', accounts[0]);
  return accounts[0];
};

const setChainId = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  sessionStorage.setItem('chainId', chainId);
  return chainId;
};

const handleInitMarketplace = async (action, listenerApi) => {
  const sessionAccount = sessionStorage.getItem('account');
  const sessionChainId = sessionStorage.getItem('chainId');

  const id = sessionAccount || (await setAccounts());
  const chainId = sessionChainId || (await setChainId());

  listenerApi.dispatch(setChainID(chainId));

  await userLoginFlow(id, listenerApi);

  window.ethereum.on('chainChanged', chainID => {
    sessionStorage.setItem('chainId', chainID);
    listenerApi.dispatch(setChainID(chainID));
  });

  window.ethereum.on('accountsChanged', async accounts => {
    const newAccountID = accounts[0];
    sessionStorage.setItem('account', accounts[0]);
    await userLoginFlow(newAccountID, listenerApi);
    await handleInitMarketplace(action, listenerApi);
  });

  const {
    user: { id: userID },
    marketplace: { chainID, defaultChainID }
  } = listenerApi.getState();

  const marketplaceContract = await getMarketplaceContractFn(userID, chainID, defaultChainID);
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

const handleInitNFTState = async (listenerApi, tokenID) => {
  const {
    user: { id: userID },
    marketplace: { chainID, defaultChainID },
    nft: { metadata: currentMetadata }
  } = listenerApi.getState();

  const marketplaceContract = await getMarketplaceContractFn(userID, chainID, defaultChainID);
  const nftContract = await getNFTContractFn(userID, chainID, defaultChainID);
  const _nftOwner = await nftContract.ownerOf(tokenID);
  const owner = _nftOwner.toLowerCase();
  const uri = await nftContract.tokenURI(tokenID);
  const cid = uri.split('ipfs://')[1];
  const metadata = currentMetadata || (await API.getFromIPFS(cid));

  // TODO: Cache mechanism for transactions maybe?
  const transferFilter = nftContract.filters.Transfer(ethers.constants.AddressZero, null, tokenID);
  const transferQuery = nftContract.queryFilter(transferFilter);

  const boughtFilter = marketplaceContract.filters.Bought(null, null, tokenID, null, null, null);
  const offeredFilter = marketplaceContract.filters.Offered(null, null, tokenID, null, null);
  const auctionFilter = marketplaceContract.filters.AuctionStarted(null, null, tokenID, null, null, null);
  const auctionEndedFilter = marketplaceContract.filters.AuctionEnded(null, null, tokenID, null, null, null);
  const boughtQuery = marketplaceContract.queryFilter(boughtFilter);
  const offeredQuery = marketplaceContract.queryFilter(offeredFilter);
  const auctionQuery = marketplaceContract.queryFilter(auctionFilter);
  const auctionEndedQuery = marketplaceContract.queryFilter(auctionEndedFilter);
  const promiseList = await Promise.allSettled([transferQuery, boughtQuery, offeredQuery, auctionQuery, auctionEndedQuery]);
  const [transferPromise, ...eventPromiseList] = promiseList;
  const eventsArray = eventPromiseList.reduce((acc, eventPromise) => {
    return eventPromise.status === 'fulfilled' && eventPromise.value != null ? [...acc, eventPromise.value] : acc;
  }, []);
  const [boughtResults, , , auctionEndedResults] = eventsArray;
  const events = eventsArray.flat(1);
  const lastEvent = events.reduce((acc, event) => {
    if (acc === null) return event;
    if (parseFloat(`${event.blockNumber}.${event.transactionIndex}`) > parseFloat(`${acc.blockNumber}.${acc.transactionIndex}`)) return event;
    return acc;
  }, null);

  const sortFn = (a, b) => parseFloat(`${b.blockNumber}.${b.transactionIndex}`) - parseFloat(`${a.blockNumber}.${a.transactionIndex}`);
  const sortedEventsForActivity = [...boughtResults, ...auctionEndedResults].sort(sortFn);
  const itemId = lastEvent?.args?.itemId;
  const auctionId = lastEvent?.args?.auctionId;

  let i;
  let totalPrice;
  if (lastEvent?.event === 'Offered' || lastEvent?.event === 'AuctionStarted') {
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
    tokenId: tokenID,
    ...(itemId ? { itemId: parseInt(itemId._hex, 16) } : {}),
    ...(i ?? {}),
    ...(totalPrice ? { totalPrice } : {}),
    ...(i?.price ? { price: i.price } : {})
  };
  const finalItem = Object.entries(it).reduce((acc, [key, value]) => {
    return ethers.BigNumber.isBigNumber(value) ? { ...acc, [key]: parseInt(value._hex, 16) } : { ...acc, [key]: value };
  }, {});

  const nftTransactionData = sortedEventsForActivity.map(e => ({
    type: NFT_ACTIVITY_TYPES.SALE,
    price: ethers.utils.formatEther(e.args.price),
    from: e.args.seller,
    to: e.args.buyer
  }));
  nftTransactionData.push({ type: NFT_ACTIVITY_TYPES.MINT, price: '', from: 'Null', to: transferPromise.value[0].args.to });

  const isNFTOwnedByMarketplace = owner === marketplaceContract.address.toLowerCase();
  const isListed = isNFTOwnedByMarketplace && lastEvent.event === 'Offered';
  const isOnAuction = isNFTOwnedByMarketplace && lastEvent.event === 'AuctionStarted';

  const seller = isListed || isOnAuction ? lastEvent.args.seller.toLowerCase() : '';

  listenerApi.dispatch(setNFT({ ...finalItem, transactions: nftTransactionData, owner, seller, isListed, isOnAuction }));
};

const handlePathChanges = async (action, listenerApi) => {
  const pathName = window.location.pathname;
  const isInNFTPage = pathName.startsWith('/nft/');
  // const isInProfilePage = pathName.startsWith('/profile/');

  if (isInNFTPage) {
    const tokenID = pathName.split('/')[3];
    listenerApi.dispatch(setIsLoading(true));
    await handleInitNFTState(listenerApi, tokenID);
    listenerApi.dispatch(setIsLoading(false));
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
  matcher: isAnyOf(setCurrentPath, loadNFT),
  effect: handlePathChanges
});

export default listenerMiddleware;
