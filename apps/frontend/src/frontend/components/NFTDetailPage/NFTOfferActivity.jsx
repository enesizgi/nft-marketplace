import React from 'react';
import { ethers } from 'ethers';
import { useSelector } from 'react-redux';
import { Button } from '@chakra-ui/react';
import DetailsDropdown from '../DetailsDropdown';
import ScNFTDetailActivity from './NFTDetailActivity/ScNFTDetailActivity';
import AddressDisplay from '../AddressDisplay';
import {
  getIsListed,
  getItemId,
  getMarketplaceContract,
  getNFTContract,
  getNFTOffers,
  getNFTSeller,
  getTokenId,
  getUserId,
  getwETHContract
} from '../../store/selectors';
import ScContractAddress from './ScContractAddress';
import { compare } from '../../utils';

const NFTOfferActivity = () => {
  const userId = useSelector(getUserId);
  const offers = useSelector(getNFTOffers);
  const nftSeller = useSelector(getNFTSeller);
  const isSellerPage = compare(nftSeller, userId);
  const wEthContract = useSelector(getwETHContract);
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftTokenId = useSelector(getTokenId);
  const nftItemId = useSelector(getItemId);
  const isListed = useSelector(getIsListed);
  const handleAccept = offerIndex => async () => {
    await marketplaceContract.acceptERCOffer(wEthContract.address, nftContract.address, nftTokenId, nftItemId, offerIndex, isListed);
  };

  const handleCancel = offerIndex => async () => {
    await marketplaceContract.cancelERCOffer(wEthContract.address, nftTokenId, offerIndex);
  };

  return (
    <DetailsDropdown title="Offer Activity">
      <ScNFTDetailActivity>
        <tr className="nft-activity-title">
          <th>Price</th>
          <th>Expiration</th>
          <th>From</th>
          <th> Action </th>
        </tr>
        {offers &&
          Object.entries(offers).map(([offerIndex, offer]) => (
            <tr className="nft-activity-content" key={offerIndex}>
              <td className="nft-activity-content-item">{offer.amount && `${ethers.utils.formatEther(offer.amount)} wETH`}</td>
              <td className="nft-activity-content-item">{ethers.utils.formatEther(offer.deadline)}</td>
              <td className="nft-activity-content-item">
                <ScContractAddress>
                  <AddressDisplay address={offer.offerer} isShortAddress />
                </ScContractAddress>
              </td>
              <td className="nft-activity-content-item">
                {isSellerPage && (
                  <Button colorScheme="linkedin" onClick={handleAccept(offer.offerIndex)}>
                    Accept
                  </Button>
                )}
                {offer.offerer === userId && (
                  <Button colorScheme="linkedin" onClick={handleCancel(offer.offerIndex)}>
                    {' '}
                    Cancel
                  </Button>
                )}
              </td>
            </tr>
          ))}
      </ScNFTDetailActivity>
    </DetailsDropdown>
  );
};

export default NFTOfferActivity;
