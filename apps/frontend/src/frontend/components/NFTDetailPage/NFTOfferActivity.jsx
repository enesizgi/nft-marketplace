import React from 'react';
import { ethers } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@chakra-ui/react';
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
import API from '../../modules/api/index';
import ScContractAddress from './ScContractAddress';
import { compare, convertBigNumberToNumber } from '../../utils';
import DetailsTable from './DetailsTable';
import { loadNFT } from '../../store/uiSlice';

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

  const dispatch = useDispatch();
  const handleAccept = offer => async () => {
    try {
      await marketplaceContract.acceptERCOffer(
        wEthContract.address,
        nftContract.address,
        nftTokenId,
        nftItemId,
        isListed,
        offer.deadline,
        offer.offerer,
        offer.amount,
        parseInt(offer.v, 16),
        offer.r,
        offer.s
      );
      // TODO: move this to backend with set Interval
      await API.deleteAcceptedOffers({ offerer: offer.offerer });
    } catch (err) {
      console.log(err);
    }
    dispatch(loadNFT());
  };

  const handleCancel = offer => async () => {
    try {
      await API.deleteOffer({ offerer: offer.offerer, tokenId: nftTokenId, deadline: convertBigNumberToNumber(offer.deadline) });
    } catch (err) {
      console.log(err);
    }
    dispatch(loadNFT());
  };

  const getOfferDeadlineDate = offer => {
    const deadline = convertBigNumberToNumber(offer.deadline);
    const date = new Date(deadline * 1000);
    return date.toLocaleString();
  };

  const headers = [<th key={1}>Price</th>, <th key={2}>Expiration</th>, <th key={3}>From</th>, <th key={4}> </th>];
  const content =
    offers &&
    Object.entries(offers).map(([offerIndex, offer]) => (
      <tr className="nft-activity-content" key={offerIndex}>
        <td className="nft-activity-content-item">{offer.amount && `${ethers.utils.formatEther(offer.amount)} wETH`}</td>
        <td className="nft-activity-content-item">{getOfferDeadlineDate(offer)}</td>
        <td className="nft-activity-content-item">
          <ScContractAddress>
            <AddressDisplay address={offer.offerer} isShortAddress />
          </ScContractAddress>
        </td>
        <td className="nft-activity-content-item">
          {isSellerPage && (
            <Button colorScheme="linkedin" onClick={handleAccept(offer)}>
              Accept
            </Button>
          )}
          {offer.offerer === userId && (
            <Button colorScheme="linkedin" onClick={handleCancel(offer)}>
              {' '}
              Cancel
            </Button>
          )}
        </td>
      </tr>
    ));

  return <DetailsTable title="Offer Activity" headers={headers} content={content} />;
};

export default NFTOfferActivity;
