import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import AddressDisplay from '../../AddressDisplay';
import { getETHPriceUSD, getNFTBids } from '../../../store/selectors';
import ScContractAddress from '../ScContractAddress';
import DetailsTable from '../DetailsTable';
import API from '../../../modules/api';
import { setETHPriceUSD } from '../../../store/marketplaceSlice';

const BidActivity = () => {
  const dispatch = useDispatch();
  const bids = useSelector(getNFTBids);
  const ethPriceUSD = useSelector(getETHPriceUSD);
  const now = new Date();

  const createAgoDateString = (date1, date2) => {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const days = Math.floor(diff / (1000 * 3600 * 24));
    const hours = Math.floor((diff - days * (1000 * 3600 * 24)) / (1000 * 3600));
    const minutes = Math.floor((diff - days * (1000 * 3600 * 24) - hours * (1000 * 3600)) / (1000 * 60));
    const seconds = Math.ceil((diff - days * (1000 * 3600 * 24) - hours * (1000 * 3600) - minutes * (1000 * 60)) / 1000);
    const dayString = Object.entries({ d: days, h: hours, m: minutes, s: seconds }).reduce((acc, [key, value]) => {
      if (value > 0) return `${acc} ${value} ${key} `;
      return acc;
    }, '');
    return `${dayString.trim()} ago`;
  };

  const getFormattedEther = amount => {
    try {
      return ethers.utils.formatEther(amount.toString());
    } catch (e) {
      console.log(e);
      return 0;
    }
  };

  useEffect(() => {
    const getEthPrice = async () => {
      try {
        const response = await API.getETHUSDPrice();
        if (response?.price) {
          dispatch(setETHPriceUSD(response.price));
        }
      } catch (e) {
        console.log(e);
      }
    };
    getEthPrice();
    const intervalId = setInterval(getEthPrice, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const getUSDPrice = (amount, price) => (getFormattedEther(amount) * price).toFixed(2);

  const headers = [<th key={1}>Price (ETH)</th>, <th key={2}>Price (USD)</th>, <th key={3}>From</th>, <th key={4}>Date</th>];
  const content = Object.entries(bids).map(([bidId, bid]) => (
    <tr className="nft-activity-content" key={bidId}>
      <td className="nft-activity-content-item">{getFormattedEther(bid.amount)}</td>
      <td className="nft-activity-content-item">{getUSDPrice(bid.amount, ethPriceUSD)}</td>
      <td className="nft-activity-content-item">
        <ScContractAddress>
          <AddressDisplay address={bid.bidder} isShortAddress />
        </ScContractAddress>
      </td>
      <td className="nft-activity-content-item">{createAgoDateString(new Date(bid.doc_created_at), now)}</td>
    </tr>
  ));

  return <DetailsTable title="Bid Activity" headers={headers} content={content} />;
};

export default BidActivity;
