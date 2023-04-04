import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiRefresh } from 'react-icons/bi';
import { ethers } from 'ethers';
import {
  getIsListed,
  getIsOnAuction,
  getNFTName,
  getNFTOwner,
  getNFTSeller,
  getNFTURL,
  getUserId,
  getMarketplaceContract,
  getwETHContract,
  getNFTContract,
  getTokenId
} from '../../../store/selectors';
import AddressDisplay from '../../AddressDisplay';
import ShareDropdown from '../ShareDropdown';
import '../ShareDropdown.css';
import NewTab from '../NFTOpenNewTab';
import { compare } from '../../../utils';
import { loadNFT } from '../../../store/uiSlice';
import SaleButton from '../SaleButton';
import AuctionButton from '../../AuctionButton';
import ScNFTDetailHeader from './ScNFTDetailHeader';

const NFTDetailHeader = () => {
  const dispatch = useDispatch();
  const userId = useSelector(getUserId);
  const itemName = useSelector(getNFTName);
  const owner = useSelector(getNFTOwner);
  const seller = useSelector(getNFTSeller);
  const url = useSelector(getNFTURL);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const isOwnerPage = compare(owner, userId);
  const isSellerPage = compare(seller, userId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const wEthContract = useSelector(getwETHContract);
  const nftContract = useSelector(getNFTContract);
  const nftTokenId = useSelector(getTokenId);

  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const onFocus = () => {
      if (!isWindowFocused) setIsWindowFocused(true);
    };
    const onBlur = () => {
      if (isWindowFocused) setIsWindowFocused(false);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [isWindowFocused]);

  const handleReloadNftInfo = () => {
    dispatch(loadNFT());
  };
  const getPermitSignature = async (signer, token, spender, value, deadline) => {
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
  const makeOffer = async () => {
    // const chainId = window.sessionStorage.getItem('chainId');
    // const provider = new ethers.providers.JsonRpcProvider(CHAIN_PARAMS[chainId || defaultChainId].rpcUrls[0]);
    // const signer = provider.getSigner();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const amount = ethers.utils.parseEther('10');
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const { v, r, s } = await getPermitSignature(signer, wEthContract, marketplaceContract.address, amount, deadline);
    console.log(s);
    // TODO: Balance check of wETH before calling
    await marketplaceContract.makeERCOffer(wEthContract.address, nftContract.address, nftTokenId, amount, deadline, v, r, s);
  };

  useEffect(() => {
    if (isWindowFocused) {
      dispatch(loadNFT());
    }
    const intervalId = setInterval(() => {
      if (isWindowFocused) {
        dispatch(loadNFT());
      }
    }, 15000);
    return () => {
      clearInterval(intervalId);
    };
  }, [isWindowFocused]);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <div className="nft-header-name-nftName">
          <p className="nftTitle">{itemName}</p>
          <button type="button" className="refresh-button" onClick={handleReloadNftInfo}>
            <BiRefresh />
          </button>
          <NewTab url={url} />
          <ShareDropdown url={url} />
        </div>

        {!isOwnerPage && (
          <div className="nft-header-name-owner">
            <AddressDisplay address={seller || owner} label="Owned By" className="nft-header-name-owner-id" />
          </div>
        )}
      </div>
      {(isListed || isOwnerPage) && <SaleButton />}
      {isOnAuction && <AuctionButton />}
      {(isListed || isOnAuction) && !isSellerPage && (
        <button type="button" onClick={makeOffer}>
          {' '}
          Make Offer
        </button>
      )}
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
