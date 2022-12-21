import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setUser } from './userSlice';
import API from '../modules/api';
import { generateSignatureData } from '../utils';
import { setChainID, setIsLoadingContracts } from './marketplaceSlice';

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
    const { slug, name } = userInfo;
    listenerApi.dispatch(setUser({ id, slug, name }));
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

listenerMiddleware.startListening({
  type: 'INIT_MARKETPLACE',
  effect: handleInitMarketplace
});

export default listenerMiddleware;
