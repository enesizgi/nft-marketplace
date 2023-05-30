/* eslint-disable react/prop-types */
/* eslint-disable no-await-in-loop */
// TODO @Enes: Remove all eslint disables
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import uniqBy from 'lodash/uniqBy';
import { useSelector } from 'react-redux';
import API from '../modules/api';
import NFTShowcase from './NFTShowcase';
import { getChainId, getNFTContract, getUserId } from '../store/selectors';
import { CHAIN_PARAMS, defaultChainId } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const OwnedPage = ({ profileId, selectedTab, setCounter }) => {
  const [loading, setLoading] = useState(true);
  const [ownedItems, setOwnedItems] = useState([]);
  const nftContract = useSelector(getNFTContract);
  const userId = useSelector(getUserId);
  const chainId = useSelector(getChainId);

  const loadOwnedItems = async () => {
    const ownedCount = await nftContract.balanceOf(profileId);
    const ownedItemIds = [];
    for (let i = 0; i < ownedCount; i += 1) {
      ownedItemIds.push(i);
    }
    const ownedItemsLocal = await Promise.allSettled(
      ownedItemIds.map(async i => {
        const tokenId = await nftContract.tokenOfOwnerByIndex(profileId, i);
        const uri = await nftContract.tokenURI(tokenId);
        const cid = uri.split('ipfs://')[1];
        const metadata = await API.getFromIPFS(cid);
        return {
          ...metadata,
          tokenId
        };
      })
    );
    setOwnedItems(ownedItemsLocal.filter(i => i.status === 'fulfilled').map(i => i.value));
    setLoading(false);
  };

  const getContractFn = async (address, abi) => {
    if (userId && chainId) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer1 = provider.getSigner();
      return new ethers.Contract(address, abi, signer1);
    }
    const provider = new ethers.providers.JsonRpcProvider(CHAIN_PARAMS[chainId || defaultChainId].rpcUrls[0]);
    return new ethers.Contract(address, abi, provider);
  };
  const loadChainNFTs = async () => {
    const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
    if (!ETHERSCAN_API_KEY) return;
    const network = 'goerli';

    const etherScanProvider = ETHERSCAN_API_KEY
      ? new ethers.providers.EtherscanProvider(network, ETHERSCAN_API_KEY)
      : new ethers.providers.EtherscanProvider(network);
    const history = await etherScanProvider.getHistory(profileId);
    const possibleContracts = uniqBy(history.map(tx => (tx.to === profileId ? tx.from?.toLowerCase() : tx.to?.toLowerCase())).filter(i => i));
    const requests = possibleContracts.map(async possibleContract => {
      try {
        const contract = await getContractFn(possibleContract, [
          'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
          'function balanceOf(address _owner) external view returns (uint256)',
          'function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256)',
          'function tokenURI(uint256 _tokenId) external view returns (string)'
        ]);

        const supportsInterface = await contract?.supportsInterface('0x80ac58cd'); // ERC721
        if (supportsInterface) {
          // We have a contract that supports ERC721
          return contract;
        }
      } catch (error) {
        console.error(error);
      }
      return null;
    });
    const responses = await Promise.allSettled(requests);
    const contracts = responses
      .filter(i => i?.value)
      .filter(i => i?.status === 'fulfilled')
      .map(i => i?.value);

    const chainNftRequests = contracts.map(async contract => {
      const balanceOf = await contract?.balanceOf(profileId);
      try {
        const chainItemIds = [];
        for (let i = 0; i < balanceOf; i += 1) {
          chainItemIds.push(i);
        }
        const chainRequests = chainItemIds.map(async i => {
          try {
            const tokenId = await contract.tokenOfOwnerByIndex(profileId, i);
            const uri = await contract.tokenURI(tokenId);
            if (uri.startsWith('ipfs://')) {
              const cid = uri.split('ipfs://')[1];
              const metadata = await API.getFromIPFS(cid);
              // TODO @Enes: Get image from IPFS if it's not on our API.
              return {
                ...metadata,
                tokenId
              };
            }
            return uri;
          } catch (error) {
            console.error(error, balanceOf);
            return null;
          }
        });
        const chainItemsLocal = await Promise.allSettled(chainRequests);
        return chainItemsLocal
          .filter(i => i?.value)
          .filter(i => i?.status === 'fulfilled')
          .map(i => i?.value);
      } catch (error) {
        console.error(error, balanceOf);
        return null;
      }
    });
    const nfts = await Promise.allSettled(chainNftRequests);
    // eslint-disable-next-line
    const nftsSuccessful = nfts.reduce((acc, i) => {
      if (i?.value?.length > 0 && i?.status === 'fulfilled') {
        return [...acc, ...i.value];
      }
      return acc;
    }, []);
  };

  useEffect(() => {
    const load = async () => {
      await loadChainNFTs();
      await loadOwnedItems();
    };
    load();
  }, []);
  if (loading) {
    return <LoadingSpinner />;
  }
  return <NFTShowcase NFTs={ownedItems} selectedTab={selectedTab} setCounter={setCounter} />;
};

export default OwnedPage;
