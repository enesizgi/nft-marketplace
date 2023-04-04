import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { getMarketplaceContract, getNFTContract, getUserId, getwETHContract } from '../../../store/selectors';
import { getNFTMetadata } from '../../utils';
import Button from '../../Button';
import { loadNFT, setActiveModal, setLoading } from '../../../store/uiSlice';
import ScOfferModal from './ScOfferModal';

const OfferModal = ({ tokenId }) => {
  const [nftMetadata, setNFTMetadata] = useState({});
  const userId = useSelector(getUserId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const wEthContract = useSelector(getwETHContract);

  const [expireTime, setExpireTime] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    const runAsync = async () => {
      const metadata = await getNFTMetadata(tokenId);
      setNFTMetadata(metadata);
    };
    runAsync();
  }, [tokenId]);

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

  const handleMakeOffer = async () => {
    if (expireTime === '' && offerAmount === '') {
      setError('You need to set the values');
      return;
    }
    if (expireTime === '') {
      setError('You need to set the expire time');
      return;
    }
    if (offerAmount === '') {
      setError('You need to set the offer amount');
      return;
    }
    const wETHbalance = await wEthContract.balanceOf(userId);
    if (ethers.utils.formatEther(wETHbalance) < parseFloat(offerAmount)) {
      setError('You dont have enough wETH to make offer');
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const amount = ethers.utils.parseEther(offerAmount);
    const deadline = new Date(expireTime).getTime() / 1000;
    dispatch(setLoading({ isLoading: true, message: 'The item is getting prepared for sale...' }));
    try {
      const { v, r, s } = await getPermitSignature(signer, wEthContract, marketplaceContract.address, amount, deadline);
      await marketplaceContract.makeERCOffer(wEthContract.address, nftContract.address, tokenId, amount, deadline, v, r, s);
      dispatch(setLoading(false));
      dispatch(setActiveModal(''));
      dispatch(loadNFT());
    } catch (e) {
      setError('Transaction denied!');
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (!!expireTime && !!offerAmount) {
      setError('');
    }
  }, [expireTime, offerAmount]);

  return (
    <ScOfferModal>
      <div className="nft-overview">
        <img className="nft-overview-image" src={nftMetadata.url} alt="nftImage" />
        <div className="nft-overview-text">
          <span className="nft-overview-text-name">{nftMetadata.name}</span>
          <span className="nft-overview-text-description">{nftMetadata.description}</span>
        </div>
      </div>
      <div className="offer">
        <label className="offer-label" htmlFor="offer-price">
          Offer Amount
        </label>
        <div className="offer-input">
          <input id="offer-price" type="number" onChange={e => setOfferAmount(e.target.value)} value={offerAmount} />
          <span className="offer-input-eth">wETH</span>
        </div>
        <label className="offer-label" htmlFor="offer-date">
          Expire Time
        </label>
        <div className="offer-input">
          <input id="offer-date" type="datetime-local" onChange={e => setExpireTime(e.target.value)} value={expireTime} />
        </div>
      </div>
      <div className="offer-modal-footer">
        <span className="offer-modal-error">{error}</span>
        <Button onClick={handleMakeOffer} className="offer-modal-button">
          Make Offer
        </Button>
      </div>
    </ScOfferModal>
  );
};
export default OfferModal;
