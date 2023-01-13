/* eslint-disable */
import React from 'react';
import styled from 'styled-components';
import { BsFullscreen } from 'react-icons/bs';

const ScOpenLinkButton = styled.div`
  position: relative;
  display: inline-block;
  float: right;

  .openbtn {
    background-color: ${({ theme }) => theme.blue};
    border: 3px solid ${({ theme }) => theme.blue};
    border-radius: 17px;
    box-shadow: rgb(0 0 0 / 10%) 0 2px 4px 0;
    box-sizing: border-box;
    color: #fff;
    cursor: pointer;
    font-family: 'Akzidenz Grotesk BQ Medium', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    font-weight: 400;
    outline: none;
    outline: 0;
    padding: 4px 6px;
    margin-right: 16px;
    text-align: center;
    transform: translateY(0);
    transition: transform 150ms, box-shadow 150ms;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
`;

function OpenLinkButton(props) {
  const handleClick = () => {
    window.open(props.url, '_blank');
  };

  return (
    <ScOpenLinkButton>
      <button className="openbtn" onClick={handleClick}>
        <BsFullscreen style={{ fontSize: '20px' }}></BsFullscreen>
      </button>
    </ScOpenLinkButton>
  );
}

export default OpenLinkButton;
