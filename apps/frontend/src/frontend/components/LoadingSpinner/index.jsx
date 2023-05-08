import React from 'react';
import Styled from 'styled-components';

const ScLoadingSpinner = Styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 100px;
    min-width: 100px;
    margin: auto;
 
    .loading-spinner {
      border: 8px solid rgba(0, 137, 168, 0.3);
      border-top: 8px solid ${({ theme }) => theme.blue};
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 0.8s linear infinite;
    }
    
    .loading-message {
      margin-top: 30px;
      text-align: center;
      font-size: 24px;
      font-weight: 600;
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

const LoadingSpinner = ({ message }) => (
  <ScLoadingSpinner>
    <div className="loading-spinner" />
    {message && <p className="loading-message">{message}</p>}
  </ScLoadingSpinner>
);

export default LoadingSpinner;
