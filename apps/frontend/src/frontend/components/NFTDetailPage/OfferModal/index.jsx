import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { getNFTMetadata, getPermitSignature } from '../../utils';
import { getChainIdWithDefault, getMarketplaceContract, getUserId, getwETHContract } from '../../../store/selectors';
import Button from '../../Button';
import { loadNFT, setActiveModal, setLoading } from '../../../store/uiSlice';
import API from '../../../modules/api/index';
import ScOfferModal from './ScOfferModal';

const OfferModal = ({ tokenId }) => {
  const [nftMetadata, setNFTMetadata] = useState({});
  const userId = useSelector(getUserId);
  const currentChainId = useSelector(getChainIdWithDefault);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const wEthContract = useSelector(getwETHContract);

  const [expireTime, setExpireTime] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    const runAsync = async () => {
      const metadata = await getNFTMetadata(userId, currentChainId, tokenId);
      setNFTMetadata(metadata);
    };
    runAsync();
  }, [tokenId]);

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
      const vStr = ethers.utils.hexlify(v);
      const rStr = ethers.utils.hexlify(r);
      const sStr = ethers.utils.hexlify(s);
      await API.createOffer({ offerer: userId, amount, tokenId, deadline, v: vStr, r: rStr, s: sStr });
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
