import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { setSignedMessage, setUser } from './userSlice';
import API from '../modules/api';
import { generateSignatureData, serializeBigNumber } from '../utils';
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
      const { slug, name } = createdUser;
      listenerApi.dispatch(setUser({ id: id.toLowerCase(), slug, name }));
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
    nft: { metadata: currentMetadata, tokenId: currentTokenId, transactions: currentTransactions = [] }
  } = listenerApi.getState();
  const tokenId = action.payload;

  const marketplaceContract = await getMarketplaceContractFn(userId, chainId);
  const nftContract = await getNFTContractFn(userId, chainId);
  const _nftOwner = await nftContract.ownerOf(tokenId);
  const owner = _nftOwner.toLowerCase();
  const uri = await nftContract.tokenURI(tokenId);
  const cid = uri.split('ipfs://')[1];

  const isSameToken = tokenId === currentTokenId?.toString();
  console.log(isSameToken);
  const metadata = currentMetadata && isSameToken ? currentMetadata : await API.getFromIPFS(cid);
  const fromBlockNumber =
    isSameToken && currentTransactions.length > 0 ? currentTransactions.reduce((acc, t) => (t.blockNumber > acc ? t.blockNumber : acc), -1) + 1 : 0;
  console.log(isSameToken && currentTransactions.length > 0, fromBlockNumber, currentTokenId, tokenId);

  // TODO @Enes: Cache mechanism for transactions maybe? Get events from mongodb?
  const currentMintTransaction = isSameToken && currentTransactions.find(t => t.type === NFT_ACTIVITY_TYPES.MINT);
  const transferFilter = nftContract.filters.Transfer(ethers.constants.AddressZero, null, tokenId);
  const transferQuery = currentMintTransaction ? [] : nftContract.queryFilter(transferFilter, fromBlockNumber);

  const boughtFilter = marketplaceContract.filters.Bought(null, null, tokenId, null, null, null);
  const offeredFilter = marketplaceContract.filters.Offered(null, null, tokenId, null, null);
  const auctionFilter = marketplaceContract.filters.AuctionStarted(null, null, tokenId, null, null, null);
  const auctionEndedFilter = marketplaceContract.filters.AuctionEnded(null, null, tokenId, null, null, null);
  const boughtQuery = marketplaceContract.queryFilter(boughtFilter, fromBlockNumber);
  const offeredQuery = marketplaceContract.queryFilter(offeredFilter, fromBlockNumber);
  const auctionQuery = marketplaceContract.queryFilter(auctionFilter, fromBlockNumber);
  const auctionEndedQuery = marketplaceContract.queryFilter(auctionEndedFilter, fromBlockNumber);
  const promiseList = await Promise.allSettled([transferQuery, boughtQuery, offeredQuery, auctionQuery, auctionEndedQuery]);
  const [transferPromise, ...eventPromiseList] = promiseList;
  console.log(transferPromise);
  const eventsArray = eventPromiseList.reduce((acc, eventPromise) => {
    if (eventPromise.status === 'fulfilled' && eventPromise.value != null) acc.push(eventPromise.value);
    else acc.push([]);
    return acc;
  }, []);
  console.log(eventsArray);
  const [boughtResults, , , auctionEndedResults] = eventsArray;
  const events = eventsArray.flat(1);
  const lastEvent = events.reduce((acc, event) => {
    if (acc === null) return event;
    if (parseFloat(`${event.blockNumber}.${event.transactionIndex}`) > parseFloat(`${acc.blockNumber}.${acc.transactionIndex}`)) return event;
    return acc;
  }, null);

  const sortFn = (a, b) => parseFloat(`${b.blockNumber}.${b.transactionIndex}`) - parseFloat(`${a.blockNumber}.${a.transactionIndex}`);
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
  console.log(transferPromise.value);

  console.log([...currentTransactions, ...boughtResults, ...auctionEndedResults, ...(transferPromise.value || [])].sort(sortFn));
  const nftTransactionData = [...currentTransactions, ...boughtResults, ...auctionEndedResults, ...(transferPromise.value || [])]
    .sort(sortFn)
    .map(e => {
      const isMintTransaction = e.type === NFT_ACTIVITY_TYPES.MINT || (e.event === 'Transfer' && e.args.from === ethers.constants.AddressZero);
      return {
        event: e.event,
        args: removeIndexKeys(serializeBigNumber(e.args)),
        type: isMintTransaction ? NFT_ACTIVITY_TYPES.MINT : NFT_ACTIVITY_TYPES.SALE,
        price: isMintTransaction ? '' : ethers.utils.formatEther(ethers.BigNumber.from(e.args.price.toString())),
        from: isMintTransaction ? 'Null' : e.args.seller,
        to: isMintTransaction ? e.to ?? e.args.to : e.args.buyer,
        blockNumber: e.blockNumber,
        blockHash: e.blockHash,
        transactionHash: e.transactionHash
      };
    });

  const isNFTOwnedByMarketplace = owner === marketplaceContract.address.toLowerCase();
  const isListed = isNFTOwnedByMarketplace && lastEvent?.event === 'Offered';
  const isOnAuction = isNFTOwnedByMarketplace && lastEvent?.event === 'AuctionStarted';

  const seller = isListed || isOnAuction ? lastEvent.args.seller.toLowerCase() : '';

  listenerApi.dispatch(setNFT({ ...finalItem, transactions: nftTransactionData, owner, seller, isListed, isOnAuction }));
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
  type: '@@INIT',
  effect: () => {
    console.log('@@INIT');
  }
});

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
