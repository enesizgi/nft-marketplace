import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setUser } from './userSlice';
import API from '../modules/api';
import { generateSignatureData } from '../utils';
import { setChainID, setIsLoadingContracts } from './marketplaceSlice';
import { setProfile } from './profileSlice';

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

  userLoginFlow(id, listenerApi);

  window.ethereum.on('chainChanged', chainID => {
    listenerApi.dispatch(setChainID(chainID));
  });

  // eslint-disable-next-line
  window.ethereum.on('accountsChanged', async accounts => {
    const newAccountID = accounts[0];
    userLoginFlow(newAccountID, listenerApi);
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

listenerMiddleware.startListening({
  type: 'INIT_MARKETPLACE',
  effect: handleInitMarketplace
});

listenerMiddleware.startListening({
  type: 'INIT_PROFILE',
  effect: handleInitProfile
});

listenerMiddleware.startListening({
  type: 'INIT_NFT_DETAILS',
  effect: () => {
    console.log('inited nft');
  }
});

export default listenerMiddleware;
