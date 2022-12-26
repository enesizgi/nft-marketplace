import { createListenerMiddleware } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import sortedUniqBy from 'lodash/sortedUniqBy';
// import { useSelector } from 'react-redux';
import { setUser } from './userSlice';
import API from '../modules/api';
import { generateSignatureData } from '../utils';
import { setChainID, setIsLoadingContracts } from './marketplaceSlice';
import { setProfile } from './profileSlice';
import { setCurrentPath } from './uiSlice';
// import { getMarketplaceContract } from './selectors';
import { NFT_ACTIVITY_TYPES } from '../constants';
import { getMarketplaceContractFn, getNFTContractFn } from '../components/utils';
import { setNFT } from './nftSlice';
// import { getMarketplaceContractFn } from '../components/utils';

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
      listenerApi.dispatch(setUser({ id, slug, name }));
    }
  } else {
    const userInfo = await API.getUser(id);
    listenerApi.dispatch(setUser(userInfo));
  }
};

const handleInitMarketplace = async (action, listenerApi) => {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const id = accounts[0];
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  listenerApi.dispatch(setChainID(chainId));

  await userLoginFlow(id, listenerApi);

  window.ethereum.on('chainChanged', chainID => {
    listenerApi.dispatch(setChainID(chainID));
  });

  // eslint-disable-next-line
  window.ethereum.on('accountsChanged', async accounts => {
    const newAccountID = accounts[0];
    await userLoginFlow(newAccountID, listenerApi);
    await handleInitMarketplace(action, listenerApi);
  });

  listenerApi.dispatch(setIsLoadingContracts(false));
};

const handleInitProfile = async (action, listenerApi) => {
  const path = action.payload;
  const getUserRequest = path.startsWith('0x') ? API.getUser : API.getUserBySlug;
  const response = await getUserRequest(path);
  listenerApi.dispatch(setProfile(response));
};

const handleInitNFTState = async (listenerApi, tokenID) => {
  // TODO: Error handling
  const {
    user: { id: userID },
    marketplace: { chainID, defaultChainID }
  } = listenerApi.getState();
  const marketplaceContract = await getMarketplaceContractFn(userID, chainID, defaultChainID);
  const nftContract = await getNFTContractFn(userID, chainID, defaultChainID);
  const _nftOwner = await nftContract.ownerOf(tokenID);
  const nftOwner = _nftOwner.toLowerCase();
  const uri = await nftContract.tokenURI(tokenID);
  const cid = uri.split('ipfs://')[1];
  const metadata = await API.getFromIPFS(cid);
  const _item = {
    ...metadata,
    tokenID
  };

  let i;
  let totalPrice;
  const { itemId } = _item;
  if (itemId) {
    i = await marketplaceContract.items(itemId);
    totalPrice = await marketplaceContract.getTotalPrice(itemId);
  }
  // TODO: handle if data comes from ipfs
  const it = {
    ..._item,
    ...(i ?? {}),
    ...(totalPrice ? { totalPrice } : {}),
    ...(i?.price ? { price: i.price } : {})
  };

  // setItem(it);
  // setOwner(nftOwner.toLowerCase());
  // TODO: Cache mechanism for transactions maybe?
  const transferFilter = nftContract.filters.Transfer(null, null, tokenID);
  const transferEvents = await nftContract.queryFilter(transferFilter);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const nftTransactions = await Promise.all(
    transferEvents.map(async t => {
      return await provider.getTransaction(t.transactionHash);
    })
  );

  console.log(transferEvents, nftTransactions);

  // setTransactions(nftTransactions);

  const boughtFilter = marketplaceContract.filters.Bought(null, null, tokenID, null, null, null);
  const boughtResults = await marketplaceContract.queryFilter(boughtFilter);
  const offeredFilter = marketplaceContract.filters.Offered(null, null, tokenID, null, null);
  const offeredResults = await marketplaceContract.queryFilter(offeredFilter);
  const auctionFilter = marketplaceContract.filters.AuctionStarted(null, null, tokenID, null, null, null);
  const auctionResults = await marketplaceContract.queryFilter(auctionFilter);

  const sortedEvents = [...boughtResults, ...offeredResults, ...auctionResults].sort((a, b) => b.blockNumber - a.blockNumber);
  const uniqEvents = sortedUniqBy(sortedEvents, n => n.args.tokenId.toBigInt());
  const lastEvent = uniqEvents[0];

  if (nftOwner === marketplaceContract.address) {
    if (lastEvent.event === 'Offered') {
      console.log('offered');
      // setListed(true);
      // setIsSeller(lastEvent.args[4].toLowerCase() === profileID.toLowerCase());
    } else if (lastEvent.event === 'AuctionStarted') {
      console.log('onAuction');
      // setOnAuction(true);
      // setIsSeller(lastEvent.args[5].toLowerCase() === profileID.toLowerCase());
    }
  }

  // TODO: change the logic of the transaction detecting
  const nftTransactionData = {};
  nftTransactions.forEach(t => {
    const from = t.from.toLowerCase();
    const to = t.to.toLowerCase();
    const { blockNumber, hash } = t;
    const contractAddress = nftContract.address.toLowerCase();
    if (to === contractAddress) {
      nftTransactionData[hash] = { blockNumber, type: NFT_ACTIVITY_TYPES.MINT, price: '', from: 'Null', to: from };
    } else if (Number(ethers.utils.formatEther(t.value)) === 0.0) {
      nftTransactionData[hash] = { blockNumber, type: NFT_ACTIVITY_TYPES.TRANSFER, price: '', from, to };
    } else {
      nftTransactionData[hash] = { blockNumber, type: NFT_ACTIVITY_TYPES.SALE, price: ethers.utils.formatEther(t.value), from: to, to: from };
    }
  });
  listenerApi.dispatch(setNFT({ ...it, transactions: nftTransactionData }));
};
// {
//   contractID: {
//     tokenID: {
//     name,
//       description,
//       url: 'assets/nfts/1.png'
//     }
//   }
// }

const handlePathChanges = async (action, listenerApi) => {
  const pathName = action.payload;
  const isInNFTPage = pathName.startsWith('/nft/');
  // const isInProfilePage = pathName.startsWith('/profile/');

  if (isInNFTPage) {
    const tokenID = pathName.split('/')[3];
    await handleInitNFTState(listenerApi, tokenID);
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
  actionCreator: setCurrentPath,
  effect: handlePathChanges
});

export default listenerMiddleware;
