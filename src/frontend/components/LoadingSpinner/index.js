import React from 'react';
import './LoadingSpinner.css';
import Styled from 'styled-components';

const ScPurchasesPage = Styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LoadingSpinner = () => (
  <ScPurchasesPage>
    <div className="loading-spinner" />
  </ScPurchasesPage>
);

export default LoadingSpinner;
