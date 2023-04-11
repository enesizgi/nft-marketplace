import React from 'react';
import DetailsDropdown from '../../DetailsDropdown';
import ScNFTDetailActivity from '../NFTDetailActivity/ScNFTDetailActivity';

const DetailsTable = ({ title, headers, content }) => (
  <DetailsDropdown title={title}>
    <ScNFTDetailActivity>
      <tr className="nft-activity-title">{headers}</tr>
      {content}
    </ScNFTDetailActivity>
  </DetailsDropdown>
);

export default DetailsTable;
