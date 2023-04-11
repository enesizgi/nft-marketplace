import React from 'react';
import { useSelector } from 'react-redux';
import AddressDisplay from '../../AddressDisplay';
import { getNFTTransactions } from '../../../store/selectors';
import ScContractAddress from '../ScContractAddress';
import DetailsTable from '../DetailsTable';

const NFTDetailActivity = () => {
  const transactions = useSelector(getNFTTransactions);

  const headers = [<th>Event</th>, <th>Price</th>, <th>From</th>, <th>To</th>];
  const content = Object.entries(transactions).map(([transactionId, transaction]) => (
    <tr className="nft-activity-content" key={transactionId}>
      <td className="nft-activity-content-item">{transaction.type}</td>
      <td className="nft-activity-content-item">{transaction.price && `${transaction.price} ETH`}</td>
      <td className="nft-activity-content-item">
        <ScContractAddress>
          <AddressDisplay address={transaction.from} />
        </ScContractAddress>
      </td>
      <td className="nft-activity-content-item">
        <ScContractAddress>
          <AddressDisplay address={transaction.to} isShortAddress />
        </ScContractAddress>
      </td>
    </tr>
  ));

  return <DetailsTable title="Item Activity" headers={headers} content={content} />;
};

export default NFTDetailActivity;
