import { ethers } from 'ethers';
import { CONTRACTS } from 'contracts';
import { CHAIN_PARAMS, defaultChainId } from '../constants';
import API from '../modules/api';
import { setToast } from '../store/uiSlice';

export const dispatchToastHandler =
  dispatch =>
  (message, status = 'error', duration = 5000) =>
    dispatch(
      setToast({
        id: Math.random(),
        title: message,
        duration,
        status
      })
    );

export const checkUserRejectedHandler =
  showMessage =>
  (error, message = 'User rejected transaction.') => {
    if (error.toString().includes('code=ACTION_REJECTED')) showMessage(message);
  };

export const waitConfirmHandler = (handler, checkForUserRejectedError, setLoadingMessage) => async () => {
  try {
    if (setLoadingMessage) setLoadingMessage('Waiting for user confirmation...');
    return await handler();
  } catch (e) {
    console.error(e);
    checkForUserRejectedError(e);
    return null;
  }
};

export const waitTransactionHandler = (setLoadingMessage, dispatchToast) => async transaction => {
  try {
    setLoadingMessage('Waiting for block confirmation...');
    const receipt = await transaction.wait();
    dispatchToast('Transaction completed.', 'success');
    return receipt;
  } catch (e) {
    console.error(e);
    dispatchToast('Error happened while confirming transaction.');
    return null;
  }
};

export const getProviderOrSignerFn = (userId, chainId) => {
  if (userId && chainId) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider.getSigner();
  }
  return new ethers.providers.JsonRpcProvider(CHAIN_PARAMS[chainId || defaultChainId].rpcUrls[0]);
};

export const getMarketplaceContractFn = (userId = window.sessionStorage.getItem('account'), chainId = window.sessionStorage.getItem('chainId')) => {
  let marketplaceContract;
  if (chainId && CONTRACTS[chainId]) marketplaceContract = CONTRACTS[chainId].MARKETPLACE;
  else marketplaceContract = CONTRACTS[defaultChainId].MARKETPLACE;
  const providerOrSigner = getProviderOrSignerFn(userId, chainId);
  return new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, providerOrSigner);
};

export const getNFTContractFn = (userId = window.sessionStorage.getItem('account'), chainId = window.sessionStorage.getItem('chainId')) => {
  let nftContract;
  if (chainId && CONTRACTS[chainId]) nftContract = CONTRACTS[chainId].NFT;
  else nftContract = CONTRACTS[defaultChainId].NFT;
  const providerOrSigner = getProviderOrSignerFn(userId, chainId);
  return new ethers.Contract(nftContract.address, nftContract.abi, providerOrSigner);
};

export const getwETHContractFn = (userId = window.sessionStorage.getItem('account'), chainId = window.sessionStorage.getItem('chainId')) => {
  let wETHContract;
  if (chainId && CONTRACTS[chainId]) wETHContract = CONTRACTS[chainId].wETH;
  else wETHContract = CONTRACTS[defaultChainId].wETH;
  const providerOrSigner = getProviderOrSignerFn(userId, chainId);
  return new ethers.Contract(wETHContract.address, wETHContract.abi, providerOrSigner);
};

export const getNFTMetadata = async tokenId => {
  const nftContract = await getNFTContractFn();
  const uri = await nftContract.tokenURI(tokenId);
  const cid = uri.split('ipfs://')[1];
  const m = await API.getFromIPFS(cid);
  return m || {};
};
