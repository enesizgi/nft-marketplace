import React from 'react';
import styled from 'styled-components';

const ScCoolButton = styled.div`
  background-color: rgba(76, 130, 251, 0.24);
  border-radius: 9999px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(76, 130, 251);
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    padding: 8px 8px;
    transition: all 125ms ease-in 0s;

    &:hover {
      opacity: 0.6;
    }
  }
`;

const CoolButton = ({ children, onClick }) => (
  <ScCoolButton>
    <button type="button" onClick={onClick}>
      {children}
    </button>
  </ScCoolButton>
);

export default CoolButton;
