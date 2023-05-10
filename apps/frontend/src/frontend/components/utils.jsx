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
    if (setLoadingMessage) setLoadingMessage('Waiting for block confirmation...');
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

export const getMarketplaceContractFn = (userId, chainId) => {
  let marketplaceContract;
  if (chainId && CONTRACTS[chainId]) marketplaceContract = CONTRACTS[chainId].MARKETPLACE;
  else marketplaceContract = CONTRACTS[defaultChainId].MARKETPLACE;
  const providerOrSigner = getProviderOrSignerFn(userId, chainId);
  return new ethers.Contract(marketplaceContract.address, marketplaceContract.abi, providerOrSigner);
};

export const getNFTContractFn = (userId, chainId) => {
  let nftContract;
  if (chainId && CONTRACTS[chainId]) nftContract = CONTRACTS[chainId].NFT;
  else nftContract = CONTRACTS[defaultChainId].NFT;
  const providerOrSigner = getProviderOrSignerFn(userId, chainId);
  return new ethers.Contract(nftContract.address, nftContract.abi, providerOrSigner);
};

export const getwETHContractFn = (userId, chainId) => {
  let wETHContract;
  if (chainId && CONTRACTS[chainId]) wETHContract = CONTRACTS[chainId].wETH;
  else wETHContract = CONTRACTS[defaultChainId].wETH;
  const providerOrSigner = getProviderOrSignerFn(userId, chainId);
  return new ethers.Contract(wETHContract.address, wETHContract.abi, providerOrSigner);
};

export const getNFTMetadata = async (userId, chainId, tokenId) => {
  const nftContract = await getNFTContractFn(userId, chainId);
  const uri = await nftContract.tokenURI(tokenId);
  const cid = uri.split('ipfs://')[1];
  const m = await API.getFromIPFS(cid);
  return m || {};
};

export const getPermitSignature = async (signer, token, spender, value, deadline) => {
  const signerAddress = await signer.getAddress();
  const [nonce, name, version, chainId] = await Promise.all([token.nonces(signerAddress), token.name(), '1', signer.getChainId()]);

  return ethers.utils.splitSignature(
    // eslint-disable-next-line no-underscore-dangle
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address
      },
      {
        Permit: [
          {
            name: 'owner',
            type: 'address'
          },
          {
            name: 'spender',
            type: 'address'
          },
          {
            name: 'value',
            type: 'uint256'
          },
          {
            name: 'nonce',
            type: 'uint256'
          },
          {
            name: 'deadline',
            type: 'uint256'
          }
        ]
      },
      {
        owner: signerAddress,
        spender,
        value,
        nonce,
        deadline
      }
    )
  );
};
