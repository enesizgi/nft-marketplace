import React, { useState } from 'react';
import { TiArrowSortedDown, TiArrowSortedUp } from 'react-icons/ti';
import ScDetailsDropdown from './ScDetailsDropdown';

const DetailsDropdown = ({ title, children }) => {
  const [opened, setOpened] = useState(false);
  return (
    <ScDetailsDropdown>
      <button type="button" className="details-dropdown-button" onClick={() => setOpened(!opened)}>
        <span className="details-dropdown-button-title">{title}</span>
        <div className="details-dropdown-button-icon">{opened ? <TiArrowSortedUp /> : <TiArrowSortedDown />}</div>
      </button>
      {opened && <div className="details-dropdown-content">{children}</div>}
    </ScDetailsDropdown>
  );
};

export default DetailsDropdown;
