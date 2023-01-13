import React from 'react';
import Styled from 'styled-components';

const ScLoadingSpinner = Styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
 
    .loading-spinner {
      border: 8px solid rgba(0, 137, 168, 0.3);
      border-top: 8px solid ${({ theme }) => theme.blue};
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
`;

const LoadingSpinner = () => (
  <ScLoadingSpinner>
    <div className="loading-spinner" />
  </ScLoadingSpinner>
);

export default LoadingSpinner;
