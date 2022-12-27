/* eslint-disable */
import React from 'react';
import './NFTOpenNewTab.css';
import { BsFullscreen } from 'react-icons/bs';

function OpenLinkButton(props) {
  const handleClick = () => {
    window.open(props.url, '_blank');
  };

  return (
    <div className="open_in_new_tab">
      <button className="openbtn" onClick={handleClick}>
        <BsFullscreen style={{ fontSize: '20px' }}></BsFullscreen>
      </button>
    </div>
  );
}

export default OpenLinkButton;
